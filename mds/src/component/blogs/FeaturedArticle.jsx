import { Button } from "@mui/material"
import { Badge } from "@mui/material"
import { Clock, ArrowRight } from "lucide-react"


export default function FeaturedArticle({ article }) {
  return (
    <section className="bg-gradient-to-r from-[#1035ac] to-purple-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-6xl">🕉️</div>
          </div>

          <div className="space-y-6">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Featured</Badge>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-200">
                <Badge variant="outline" className="border-blue-300 text-blue-200">
                  {article.category}
                </Badge>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} read</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h2>

              <p className="text-blue-100 text-lg leading-relaxed">{article.content}</p>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1035ac] rounded-full flex items-center justify-center text-white font-semibold">
                    DS
                  </div>
                  <div>
                    <div className="font-medium">Divine Stays Team</div>
                    <div className="text-blue-200 text-sm">{article.date}</div>
                  </div>
                </div>

                <Button className="bg-[#1035ac] hover:bg-[#0d2a8f] text-white group">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
