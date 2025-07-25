"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Header from "@/component/blogs/Header"
import SearchBar from "@/component/blogs/SearchBar"
import CategoryFilter from "@/component/blogs/CategoryFilter"
import PopularTags from "@/component/blogs/PopularTags"
import Pagination from "@/component/blogs/Pagination"
import ArticleGrid from "@/component/blogs/ArticleGrid"
import { 
  fetchAllBlogs, 
  fetchAllCategories, 
  fetchBlogsByCategory,
  fetchBlogsByTag,
  updateFilters,
  setCurrentCategory,
  setCurrentTag,
  clearCategoryAndTag
} from '@/redux/features/blog/blogSlice'
import { useDebounce } from "@/hooks/useDebounce"

export default function Home() {
  const dispatch = useDispatch()
  const { 
    blogs, 
    categories,
    blogsByCategory,
    blogsByTag,
    pagination, 
    filters, 
    currentCategory,
    currentTag,
    isLoading, 
    isCategoriesLoading,
    error,
    categoriesError
  } = useSelector(state => state.blog)

  const [searchQuery, setSearchQuery] = useState(filters.search || "")
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || "All Articles")
  const [selectedTag, setSelectedTag] = useState(currentTag || "")

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Load initial data on component mount
  useEffect(() => {
    if (!currentCategory && !currentTag) {
      dispatch(fetchAllBlogs(filters))
    } else if (currentCategory && currentCategory !== "All Articles") {
      dispatch(fetchBlogsByCategory(currentCategory))
    } else if (currentTag) {
      dispatch(fetchBlogsByTag(currentTag))
    }
    dispatch(fetchAllCategories())
  }, [dispatch])

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      // Clear category and tag selections when searching
      dispatch(clearCategoryAndTag())
      setSelectedCategory("All Articles")
      setSelectedTag("")
      
      const newFilters = {
        ...filters,
        search: debouncedSearchQuery,
        page: 1
      }
      dispatch(updateFilters(newFilters))
      dispatch(fetchAllBlogs(newFilters))
    }
  }, [debouncedSearchQuery, dispatch, filters])

  // Prepare categories array with "All Articles" option
  const categoryOptions = useMemo(() => {
    if (isCategoriesLoading || !categories.length) {
      return ["All Articles"]
    }
    return [...categories]
  }, [categories, isCategoriesLoading])

  // Get current blogs to display based on selection
  const currentBlogs = useMemo(() => {
    if (selectedCategory !== "All Articles" && selectedCategory) {
      return blogsByCategory
    } else if (selectedTag) {
      return blogsByTag
    }
    return blogs
  }, [blogs, blogsByCategory, blogsByTag, selectedCategory, selectedTag])

  // Extract tags from current blogs
  const allTags = [...new Set(currentBlogs.flatMap(blog => blog.tags || []))]

  // Get featured article
  const featuredArticle = currentBlogs[0]

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    setSelectedTag("") // Clear tag selection
    
    // Clear search when selecting category
    setSearchQuery("")
    dispatch(updateFilters({ ...filters, search: "", page: 1 }))
    
    if (category === "All Articles") {
      dispatch(clearCategoryAndTag())
      dispatch(fetchAllBlogs({ ...filters, search: "", page: 1 }))
    } else {
      dispatch(setCurrentCategory(category))
      dispatch(setCurrentTag(""))
      dispatch(fetchBlogsByCategory(category))
    }
  }, [dispatch, filters])

  // Handle tag change
  const handleTagChange = useCallback((tag) => {
    const newTag = selectedTag === tag ? "" : tag
    setSelectedTag(newTag)
    
    // Clear search and category when selecting tag
    setSearchQuery("")
    setSelectedCategory("All Articles")
    dispatch(updateFilters({ ...filters, search: "", page: 1 }))
    
    if (newTag) {
      dispatch(setCurrentTag(newTag))
      dispatch(setCurrentCategory(""))
      dispatch(fetchBlogsByTag(newTag))
    } else {
      dispatch(clearCategoryAndTag())
      dispatch(fetchAllBlogs({ ...filters, search: "", page: 1 }))
    }
  }, [selectedTag, dispatch, filters])

  // Handle page change - this might need API updates to support pagination for category/tag APIs
  const handlePageChange = useCallback((page) => {
    if (selectedCategory !== "All Articles") {
      // You'll need to update your API to support pagination for category filtering
      console.log(`Page change for category: ${selectedCategory}, page: ${page}`)
      // dispatch(fetchBlogsByCategory(selectedCategory, page))
    } else if (selectedTag) {
      // You'll need to update your API to support pagination for tag filtering
      console.log(`Page change for tag: ${selectedTag}, page: ${page}`)
      // dispatch(fetchBlogsByTag(selectedTag, page))
    } else {
      const newFilters = { ...filters, page }
      dispatch(updateFilters(newFilters))
      dispatch(fetchAllBlogs(newFilters))
    }
  }, [dispatch, filters, selectedCategory, selectedTag])

  if (error) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading articles: {error}</p>
          <button 
            onClick={() => {
              dispatch(fetchAllBlogs(filters))
              dispatch(fetchAllCategories())
            }}
            className="mt-4 px-4 py-2 bg-[#1035ac] text-white rounded hover:bg-[#0d2a8f]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      <Header featuredArticle={featuredArticle} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalResults={currentBlogs.length}
          isSearching={isLoading && debouncedSearchQuery !== searchQuery}
        />

        <CategoryFilter
          categories={categoryOptions}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          totalResults={currentBlogs.length}
          isLoading={isCategoriesLoading}
          error={categoriesError}
        />

        <PopularTags
          tags={allTags}
          selectedTag={selectedTag}
          onTagChange={handleTagChange}
        />

        <ArticleGrid articles={currentBlogs} isLoading={isLoading} />

        {/* Note: Pagination might need updates for category/tag APIs */}
        {pagination.totalPages > 1 && !selectedCategory && !selectedTag && (
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </main>
    </div>
  )
}