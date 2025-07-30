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
  fetchAllPublicBlogs, 
  fetchAllCategories, 
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
    const initialFilters = {
      ...filters,
      ...(currentCategory && currentCategory !== "All Articles" && { category: currentCategory }),
      ...(currentTag && { tag: currentTag })
    }
    dispatch(fetchAllPublicBlogs(initialFilters))
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
        category: '',
        tag: '',
        page: 1
      }
      dispatch(updateFilters(newFilters))
      dispatch(fetchAllPublicBlogs(newFilters))
    }
  }, [debouncedSearchQuery, dispatch, filters])



  // Extract tags from current blogs
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags || []))]

  // Get featured article
  const featuredArticle = blogs[0]

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    setSelectedTag("") // Clear tag selection
    
    // Clear search when selecting category
    setSearchQuery("")
    
    const newFilters = {
      ...filters,
      search: "",
      category: category === "All Articles" ? "" : category,
      tag: "",
      page: 1
    }
    
    dispatch(updateFilters(newFilters))
    dispatch(setCurrentCategory(category === "All Articles" ? "" : category))
    dispatch(setCurrentTag(""))
    dispatch(fetchAllPublicBlogs(newFilters))
  }, [dispatch, filters])

  // Handle tag change
  const handleTagChange = useCallback((tag) => {
    const newTag = selectedTag === tag ? "" : tag
    setSelectedTag(newTag)
    
    // Clear search and category when selecting tag
    setSearchQuery("")
    setSelectedCategory("All Articles")
    
    const newFilters = {
      ...filters,
      search: "",
      category: "",
      tag: newTag,
      page: 1
    }
    
    dispatch(updateFilters(newFilters))
    dispatch(setCurrentTag(newTag))
    dispatch(setCurrentCategory(""))
    dispatch(fetchAllPublicBlogs(newFilters))
  }, [selectedTag, dispatch, filters])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    const newFilters = { ...filters, page }
    dispatch(updateFilters(newFilters))
    dispatch(fetchAllPublicBlogs(newFilters))
  }, [dispatch, filters])

  if (error) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading articles: {error}</p>
          <button 
            onClick={() => {
              dispatch(fetchAllPublicBlogs(filters))
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
          totalResults={blogs.length}
          isSearching={isLoading && debouncedSearchQuery !== searchQuery}
        />

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          totalResults={blogs.length}
          isLoading={isCategoriesLoading}
          error={categoriesError}
        />

        <PopularTags
          tags={allTags}
          selectedTag={selectedTag}
          onTagChange={handleTagChange}
        />

        <ArticleGrid articles={blogs} isLoading={isLoading} />

        {pagination.totalPages > 1 && (
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