import { useHTMLContent } from "@/hooks/useHTMLContent"
import { Clock, ArrowRight } from "lucide-react"
import staticImg from "../../../public/featured-places/Ambaji.png"
import Link from "next/link"

export default function ArticleCard({ article }) {
  const getCategoryColor = (category) => {
    switch (category) {
      case "Spiritual Places":
        return "from-orange-400 to-orange-600"
      case "Travel Tips":
        return "from-green-400 to-green-600"
      case "Partner Stories":
        return "from-orange-500 to-red-500"
      default:
        return "from-blue-400 to-blue-600"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Spiritual Places":
        return "🏛️"
      case "Travel Tips":
        return "💰"
      case "Partner Stories":
        return "🏆"
      default:
        return "📄"
    }
  }

  // Calculate read time if not provided
  const readTime = article.readTime || Math.ceil(article.content?.length / 200) || 5


  const truncatedContent = useHTMLContent(article.content, { maxLength: 150 })

  return (
    <Link href={`/blogs/${article.slug}`}>
      <div className="overflow-hidden rounded-xl hover:shadow-lg hover:-translate-2 border border-[#1034ac23] transition-shadow duration-300">
      <div className="relative w-full aspect-video overflow-hidden"> 
  <img 
    src={article.image || staticImg.src} 
    alt={article.title} 
    className="absolute inset-0 w-full h-full object-cover" 
  />
</div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Clock className="w-4 h-4" />
          <span>{readTime} min read</span>
          <span>•</span>
          <span>{new Date(article.createdAt || article.date).toLocaleDateString()}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{article.title}</h3>
      </div>

      <div className="px-3 pb-3">
        <div className="text-gray-600 text-sm line-clamp-3 mb-4">
          {truncatedContent}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {(article.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="bg-[#3741511c] p-1 px-2 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
          <footer className="pt-0">
            <button
              variant="outline"
              size="sm"
              className="w-full flex items-center group hover:text-[#1035ac]"
              onClick={() => window.location.href = `/blogs/${article.slug}`}
            >
              Read More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </footer>
        </div>
      </div>
    </div>
    </Link>
  )
}