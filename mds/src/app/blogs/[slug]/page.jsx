"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogBySlug } from '@/redux/features/blog/blogSlice'
import { Eye, ArrowLeft, Calendar } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useHTMLContent } from '@/hooks/useHTMLContent'
import Head from 'next/head'
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

  // Update meta tags when blog data is loaded
  useEffect(() => {
    if (currentBlog) {
      // Update document title
      document.title = currentBlog.seoTitle || currentBlog.title || 'Blog Post'
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', currentBlog.seoDescription || '')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = currentBlog.seoDescription || ''
        document.head.appendChild(meta)
      }

      // Update canonical URL
      const canonical = document.querySelector('link[rel="canonical"]')
      const canonicalUrl = `${window.location.origin}/blogs/${params.slug}`
      if (canonical) {
        canonical.setAttribute('href', canonicalUrl)
      } else {
        const link = document.createElement('link')
        link.rel = 'canonical'
        link.href = canonicalUrl
        document.head.appendChild(link)
      }

      // Update Open Graph tags
      updateMetaTag('og:title', currentBlog.seoTitle || currentBlog.title)
      updateMetaTag('og:description', currentBlog.seoDescription || '')
      updateMetaTag('og:image', currentBlog.image || '')
      updateMetaTag('og:url', canonicalUrl)
      updateMetaTag('og:type', 'article')

      // Update Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image')
      updateMetaTag('twitter:title', currentBlog.seoTitle || currentBlog.title)
      updateMetaTag('twitter:description', currentBlog.seoDescription || '')
      updateMetaTag('twitter:image', currentBlog.image || '')
    }
  }, [currentBlog, params.slug])

  // Helper function to update meta tags
  const updateMetaTag = (property, content) => {
    if (!content) return
    
    let metaTag = document.querySelector(`meta[property="${property}"]`)
    if (!metaTag) {
      metaTag = document.querySelector(`meta[name="${property}"]`)
    }
    
    if (metaTag) {
      metaTag.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        meta.setAttribute('property', property)
      } else {
        meta.setAttribute('name', property)
      }
      meta.content = content
      document.head.appendChild(meta)
    }
  }

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
              <span className="text-6xl">🎨</span>
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

        {/* Blog Content */}
        <div className="blog-content max-w-none text-gray-800 leading-relaxed">
          {truncatedContent}
        </div>
      </div>
    </div>
  )
}