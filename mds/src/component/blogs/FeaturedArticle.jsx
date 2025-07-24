import { useHTMLContent } from "@/hooks/useHTMLContent"
import { Button } from "@mui/material"
import { Badge } from "@mui/material"
import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"


export default function FeaturedArticle({ article }) {
  const truncatedContent = useHTMLContent(article.content, { maxLength: 150 })
  return (
    <section className=" ">
      <div className="container mx-auto rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-8  shadow-2xl rounded-3xl  items-center">
          <div className="bg-gradient-to-br from-purple-500 rounded-tl-3xl rounded-bl-3xl to-purple-700 p-8 flex items-center justify-center h-full">
            <div className="text-6xl">🕉️</div>
          </div>

          <div className="space-y-6">

            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 ">
                <Badge variant="outline" className="border-blue-300 ">
                  {article.category}
                </Badge>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} read</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h2>

              <div className=" text-lg leading-relaxed">{truncatedContent}</div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1035ac] text-white rounded-full flex items-center justify-center  font-semibold">
                    DS
                  </div>
                  <div>
                    <div className="font-medium">Divine Stays Team</div>
                    <div className=" text-sm">{article.date}</div>
                  </div>
                </div>

               <Link href={`/blogs/${article.slug}`}>
                <Button className="bg-[#1035ac] hover:bg-[#0d2a8f]  group">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
