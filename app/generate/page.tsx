"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Megaphone, Globe, MessageSquare, PenTool, Workflow, Search, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

const contentTypes = [
  {
    id: "email",
    name: "Email Sequence",
    icon: Mail,
    description: "Create converting email campaigns and drip sequences",
    color: "bg-blue-500",
    credits: 3,
    popular: true,
    features: ["Welcome sequences", "Nurture campaigns", "Product launches", "Re-engagement flows"],
  },
  {
    id: "ad",
    name: "Ad Copy",
    icon: Megaphone,
    description: "Generate high-performing ad copy for all platforms",
    color: "bg-green-500",
    credits: 2,
    popular: true,
    features: ["Facebook ads", "Google ads", "LinkedIn ads", "Twitter ads"],
  },
  {
    id: "landing",
    name: "Landing Page",
    icon: Globe,
    description: "Build compelling landing pages that convert",
    color: "bg-purple-500",
    credits: 4,
    popular: false,
    features: ["Hero sections", "Feature lists", "Testimonials", "CTAs"],
  },
  {
    id: "social",
    name: "Social Posts",
    icon: MessageSquare,
    description: "Create engaging social media content",
    color: "bg-pink-500",
    credits: 1,
    popular: true,
    features: ["Instagram posts", "LinkedIn posts", "Twitter threads", "Facebook posts"],
  },
  {
    id: "blog",
    name: "Blog Content",
    icon: PenTool,
    description: "Write SEO-optimized blog posts and articles",
    color: "bg-orange-500",
    credits: 5,
    popular: false,
    features: ["SEO articles", "How-to guides", "Listicles", "Case studies"],
  },
  {
    id: "funnel",
    name: "Sales Funnel",
    icon: Workflow,
    description: "Design complete sales funnels and sequences",
    color: "bg-indigo-500",
    credits: 8,
    popular: false,
    features: ["Lead magnets", "Sales pages", "Email sequences", "Thank you pages"],
  },
]

const categories = ["All", "Popular", "Email Marketing", "Advertising", "Content Marketing", "Social Media"]

export default function GeneratePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [credits] = useState({
    used: 45,
    total: 200,
  })

  const filteredContentTypes = contentTypes.filter((type) => {
    const matchesSearch =
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Popular" && type.popular) ||
      type.name.toLowerCase().includes(selectedCategory.toLowerCase().replace(" marketing", "").replace(" media", ""))

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Generate Content</h1>
          <p className="text-muted-foreground">Choose a content type to start creating with AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            {credits.total - credits.used} credits remaining
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContentTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-all duration-200 group relative">
            {type.popular && <Badge className="absolute -top-2 -right-2 z-10">Popular</Badge>}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${type.color}`}>
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{type.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {type.credits} credit{type.credits > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="text-base mt-3">{type.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">What you can create:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {type.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                  {type.features.length > 3 && <li className="text-xs">+{type.features.length - 3} more</li>}
                </ul>
              </div>

              <Link href={`/generate/${type.id}`} className="block">
                <Button
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  variant="outline"
                  disabled={credits.total - credits.used < type.credits}
                >
                  {credits.total - credits.used < type.credits ? (
                    "Insufficient Credits"
                  ) : (
                    <>
                      Generate Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContentTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No content types found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
