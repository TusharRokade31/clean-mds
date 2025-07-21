// app/blog/[slug]/page.jsx
"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogBySlug } from '@/redux/features/blog/blogSlice'
import { Clock, ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function BlogDetail({params}) {
  const dispatch = useDispatch()
  const param = useParams()
  console.log(param, "prams")
  const { currentBlog, isLoading, error } = useSelector(state => state.blog)

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
    <div className="min-h-screen mt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#1035ac] hover:text-[#0d2a8f] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>

        <article className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4" />
            <span>{currentBlog.readTime} min read</span>
            <span>•</span>
            <span>{new Date(currentBlog.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 className="text-4xl font-bold mb-6">{currentBlog.title}</h1>

          {currentBlog.image && (
            <img 
              src={currentBlog.image} 
              alt={currentBlog.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <div className="prose max-w-none">
            {currentBlog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            {(currentBlog.tags || []).map((tag) => (
              <span 
                key={tag} 
                className="bg-[#3741511c] p-2 px-3 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}