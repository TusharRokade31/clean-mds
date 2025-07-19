"use client"

import { useState, useMemo } from "react"
import Header from "@/component/blogs/Header"
import SearchBar from "@/component/blogs/SearchBar"
import CategoryFilter from "@/component/blogs/CategoryFilter"
import PopularTags from "@/component/blogs/PopularTags"
import FeaturedArticle from "@/component/blogs/FeaturedArticle"
import Pagination from "@/component/blogs/Pagination"
import blogsData from "../../../public/json/blogs-data.json"
import ArticleGrid from "@/component/blogs/ArticleGrid"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Articles")
  const [selectedTag, setSelectedTag] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6

  const { articles, categories } = blogsData

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    articles.forEach((article) => {
      article.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [articles])

  // Filter articles based on search, category, and tag
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All Articles" || article.category === selectedCategory
      const matchesTag = !selectedTag || article.tags.includes(selectedTag)

      return matchesSearch && matchesCategory && matchesTag
    })
  }, [articles, searchQuery, selectedCategory, selectedTag])

  // Get featured article
  const featuredArticle = articles.find((article) => article.isFeatured)

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage)

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      <Header />

      {featuredArticle && <FeaturedArticle article={featuredArticle} />}

      <main className="container mx-auto px-4 py-8 space-y-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalResults={filteredArticles.length}
          onSearchChange={handleFilterChange}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          articles={articles}
          onChange={handleFilterChange}
        />

        <PopularTags
          tags={allTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onChange={handleFilterChange}
        />

        <ArticleGrid articles={paginatedArticles} />

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </main>
    </div>
  )
}
