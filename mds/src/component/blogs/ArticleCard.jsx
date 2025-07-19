import { Badge, Button, Card, CardContent, CardHeader} from "@mui/material"
import { Clock, ArrowRight } from "lucide-react"



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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`h-32 bg-gradient-to-br ${getCategoryColor(article.category)} flex items-center justify-center`}>
        <div className="text-4xl">{getCategoryIcon(article.category)}</div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>{article.readTime} read</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{article.title}</h3>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{article.content}</p>
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <footer className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full group hover:bg-[#1035ac] hover:text-white hover:border-[#1035ac] bg-transparent"
        >
          Read More
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </footer>
    </Card>
  )
}
