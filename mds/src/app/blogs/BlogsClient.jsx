"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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

export default function BlogsClient() {
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

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Track if initial load has happened
  const hasMounted = useRef(false)

  // ✅ Load initial data ONCE on mount
  useEffect(() => {
    const initialFilters = {
      ...filters,
      ...(currentCategory && currentCategory !== "All Articles" && { category: currentCategory }),
      ...(currentTag && { tag: currentTag })
    }
    dispatch(fetchAllPublicBlogs(initialFilters))
    dispatch(fetchAllCategories())
    hasMounted.current = true
  }, [dispatch]) // ✅ Only dispatch in deps, not filters

  // ✅ Handle debounced search — skip on first mount
  useEffect(() => {
    if (!hasMounted.current) return
    if (debouncedSearchQuery === filters.search) return

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
  }, [debouncedSearchQuery, dispatch]) // ✅ Removed filters from deps

  // ✅ Memoize tags so they don't recalculate on every render
  const allTags = useMemo(
    () => [...new Set(blogs.flatMap(blog => blog.tags || []))],
    [blogs]
  )

  const featuredArticle = blogs[0]

  // ✅ Removed filters from useCallback deps to prevent stale closure loops
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    setSelectedTag("")
    setSearchQuery("")
    
    const newFilters = {
      page: 1,
      search: "",
      category: category === "All Articles" ? "" : category,
      tag: "",
    }
    
    dispatch(updateFilters(newFilters))
    dispatch(setCurrentCategory(category === "All Articles" ? "" : category))
    dispatch(setCurrentTag(""))
    dispatch(fetchAllPublicBlogs(newFilters))
  }, [dispatch])

  const handleTagChange = useCallback((tag) => {
    const newTag = selectedTag === tag ? "" : tag
    setSelectedTag(newTag)
    setSearchQuery("")
    setSelectedCategory("All Articles")
    
    const newFilters = {
      page: 1,
      search: "",
      category: "",
      tag: newTag,
    }
    
    dispatch(updateFilters(newFilters))
    dispatch(setCurrentTag(newTag))
    dispatch(setCurrentCategory(""))
    dispatch(fetchAllPublicBlogs(newFilters))
  }, [selectedTag, dispatch])

  const handlePageChange = useCallback((page) => {
    // ✅ Read latest filters from store inside the thunk instead of closing over stale filters
    dispatch((_, getState) => {
      const currentFilters = getState().blog.filters
      const newFilters = { ...currentFilters, page }
      dispatch(updateFilters(newFilters))
      dispatch(fetchAllPublicBlogs(newFilters))
    })
  }, [dispatch])

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