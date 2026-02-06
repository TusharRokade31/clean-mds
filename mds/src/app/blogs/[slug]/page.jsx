"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogBySlug } from '@/redux/features/blog/blogSlice'
import { Eye, ArrowLeft, Calendar } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useHTMLContent } from '@/hooks/useHTMLContent'
import '../blog-content.css'

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
    <div className="min-h-screen w-full bg-white pb-20">
      <div className="md:w-7/12 mx-auto px-4 mt-24">
        {/* Navigation */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1035ac] mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </button>

        {/* Hero Banner Section */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-8">
          {currentBlog.image ? (
            <div className="aspect-video w-full">
              <img 
                src={currentBlog.image} 
                alt={currentBlog.title}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay for text readability if you decide to put text on top later */}
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ) : (
            <div className="h-[300px] bg-gradient-to-r from-[#5d5fef] to-[#af4fe4] flex items-center justify-center">
              <span className="text-6xl">🏨</span>
            </div>
          )}
        </div>

        {/* Blog Meta & Title */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {(currentBlog.tags || []).map((tag) => (
              <span key={tag} className="bg-blue-50 text-[#1035ac] px-3 py-1 rounded-md text-xs font-bold uppercase">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            {currentBlog.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(currentBlog.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {currentBlog.views || '1,247'} views
            </span>
          </div>
        </div>

        {/* Author Section - Redesigned */}
        {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1035ac] text-white flex items-center justify-center font-bold text-lg">
              {currentBlog?.author?.name.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">
                {currentBlog?.author?.name || "Alpha Beta Solutions"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Technology Consultant</p>
            </div>
          </div>
          <div className="hidden sm:block px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
            Author
          </div>
        </div> */}

        {/* Blog Content */}
        <div className="blog-content max-w-none text-gray-800 leading-relaxed">
          {truncatedContent}
        </div>
      </div>
    </div>
  )
}