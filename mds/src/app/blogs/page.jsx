"use client"

import { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from 'react-redux'
import Header from "@/component/blogs/Header"
import SearchBar from "@/component/blogs/SearchBar"
import CategoryFilter from "@/component/blogs/CategoryFilter"
import PopularTags from "@/component/blogs/PopularTags"
import Pagination from "@/component/blogs/Pagination"
import ArticleGrid from "@/component/blogs/ArticleGrid"
import { fetchAllBlogs, updateFilters } from '@/redux/features/blog/blogSlice'
import { useDebounce } from "@/hooks/useDebounce"

export default function Home() {
  const dispatch = useDispatch()
  const { 
    blogs, 
    pagination, 
    filters, 
    isLoading, 
    error 
  } = useSelector(state => state.blog)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Articles")
  const [selectedTag, setSelectedTag] = useState("")

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Load blogs on component mount
  useEffect(() => {
    dispatch(fetchAllBlogs(filters))
  }, [dispatch])

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      const newFilters = {
        ...filters,
        search: debouncedSearchQuery,
        page: 1 // Reset to first page when search changes
      }
      dispatch(updateFilters(newFilters))
      dispatch(fetchAllBlogs(newFilters))
    }
  }, [debouncedSearchQuery, dispatch, filters])

  // Extract categories and tags from blogs
  const categories = ["All Articles", ...new Set(blogs.map(blog => blog.category || 'General'))]
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags || []))]

  // Get featured article
  const featuredArticle = blogs[0]

  // Handle filter changes (category, tags)
  const handleFilterChange = useCallback((newFilters) => {
    const updatedFilters = { 
      ...filters, 
      ...newFilters, 
      page: 1 // Reset to first page when filters change
    }
    dispatch(updateFilters(updatedFilters))
    dispatch(fetchAllBlogs(updatedFilters))
  }, [dispatch, filters])

  // Handle category change
  const handleCategoryChange = useCallback(() => {
    const category = selectedCategory !== "All Articles" ? selectedCategory : ""
    handleFilterChange({ category })
  }, [selectedCategory, handleFilterChange])

  // Handle tag change
  const handleTagChange = useCallback(() => {
    handleFilterChange({ tag: selectedTag })
  }, [selectedTag, handleFilterChange])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    const newFilters = { ...filters, page }
    dispatch(updateFilters(newFilters))
    dispatch(fetchAllBlogs(newFilters))
  }, [dispatch, filters])

  // Handle search input change (no immediate API call)
  const handleSearchInputChange = useCallback(() => {
    // This will be handled by the debounced effect above
    // No immediate API call here
  }, [])

  if (error) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading articles: {error}</p>
          <button 
            onClick={() => dispatch(fetchAllBlogs(filters))}
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
          totalResults={pagination.total}
          onSearchChange={handleSearchInputChange}
          isSearching={isLoading && debouncedSearchQuery !== searchQuery}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          articles={blogs}
          onChange={handleCategoryChange}
        />

        <PopularTags
          tags={allTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onChange={handleTagChange}
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