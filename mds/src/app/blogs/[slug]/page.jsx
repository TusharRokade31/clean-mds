"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogBySlug } from '@/redux/features/blog/blogSlice'
import { Clock, Eye, ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useHTMLContent } from '@/hooks/useHTMLContent'
import '../blog-content.css' // Import your custom CSS

export default function BlogDetail() {
  const dispatch = useDispatch()
  const params = useParams()
  const { currentBlog, isLoading, error } = useSelector(state => state.blog)
  const truncatedContent = useHTMLContent(currentBlog?.content)

  useEffect(() => {
    if (params.slug) {
      dispatch(fetchBlogBySlug(params.slug))
    }
  }, [dispatch, params.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1035ac]"></div>
      </div>
    )
  }

  if (error || !currentBlog) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Article not found</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-[#1035ac] text-white rounded hover:bg-[#0d2a8f]"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  w-full bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#5d5fef] flex   items-center mx-auto h-[300px] w-6/12 mt-20 to-[#af4fe4] text-white px-6 py-12 ">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
          <div className="text-6xl">🏨</div>
          <div className="flex items-start text-sm space-x-4 opacity-90">
            <span>{new Date(currentBlog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span><Clock className="inline w-4 h-4 mr-1" />{currentBlog.readTime} min read</span>
            <span>•</span>
            <span><Eye className="inline w-4 h-4 mr-1" />{currentBlog.views || '1,247'} views</span>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="w-6/12 mx-auto px-4 border border-[#00000023] py-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#1035ac] hover:text-[#0d2a8f] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </button>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(currentBlog.tags || []).map((tag) => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {currentBlog.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1035ac] text-white flex items-center justify-center font-semibold uppercase">
            {currentBlog?.author?.name.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{currentBlog?.author?.name || "Alpha Beta Solutions"}</p>
            <p className="text-xs text-gray-500">Technology Consultant</p>
          </div>
        </div>

        {/* Cover Image */}
        {currentBlog.image && (
          <img 
            src={currentBlog.image} 
            alt={currentBlog.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}

        {/* Blog Content */}
        <div className="blog-content max-w-none text-gray-800">
  {truncatedContent}
</div>
      </div>
    </div>
  )
}
