"use client"

import { Button } from "@mui/material"



export default function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  articles,
  onChange,
}) {
  const getCategoryCount = (category) => {
    if (category === "All Articles") return articles.length
    return articles.filter((article) => article.category === category).length
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "All Articles":
        return "📚"
      case "Spiritual Places":
        return "🕉️"
      case "Travel Tips":
        return "✈️"
      case "Partner Stories":
        return "🤝"
      default:
        return "📄"
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    onChange()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => handleCategoryChange(category)}
            className={`flex items-center gap-2 ${
              selectedCategory === category
                ? "bg-[#1035ac] hover:bg-[#0d2a8f] text-white"
                : "border-gray-200 hover:border-[#1035ac] hover:text-[#1035ac]"
            }`}
          >
            <span>{getCategoryIcon(category)}</span>
            <span>{category}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                selectedCategory === category ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {getCategoryCount(category)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
