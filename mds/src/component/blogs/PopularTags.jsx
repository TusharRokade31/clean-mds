"use client"

import { Button } from "@mui/material"


export default function PopularTags({ tags, selectedTag, setSelectedTag, onChange }) {
  const handleTagChange = (tag) => {
    setSelectedTag(selectedTag === tag ? "" : tag)
    onChange()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0,9).map((tag) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            onClick={() => handleTagChange(tag)}
            className={`text-sm ${
              selectedTag === tag
                ? "bg-[#1035ac] text-white border-[#1035ac] hover:bg-[#0d2a8f]"
                : "border-gray-200 text-gray-600 hover:border-[#1035ac] hover:text-[#1035ac]"
            }`}
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  )
}
