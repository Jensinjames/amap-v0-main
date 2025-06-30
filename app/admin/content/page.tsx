"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MoreHorizontal,
  FileText,
  Mail,
  Megaphone,
  Globe,
  MessageSquare,
  PenTool,
  Workflow,
  Eye,
  Download,
  Trash2,
  TrendingUp,
  Clock,
} from "lucide-react"

const contentData = [
  {
    id: "1",
    title: "Welcome Email Series for SaaS",
    type: "email",
    user: "john@example.com",
    status: "completed",
    creditsUsed: 3,
    createdAt: "2024-11-28 14:30",
    wordCount: 1250,
    engagement: 8.5,
  },
  {
    id: "2",
    title: "Facebook Ad Campaign - Productivity App",
    type: "ad",
    user: "sarah@company.com",
    status: "completed",
    creditsUsed: 2,
    createdAt: "2024-11-28 12:15",
    wordCount: 450,
    engagement: 9.2,
  },
  {
    id: "3",
    title: "Landing Page Copy - E-commerce",
    type: "landing",
    user: "mike@startup.io",
    status: "completed",
    creditsUsed: 4,
    createdAt: "2024-11-28 10:45",
    wordCount: 2100,
    engagement: 7.8,
  },
  {
    id: "4",
    title: "LinkedIn Post Series - Remote Work",
    type: "social",
    user: "emily@agency.com",
    status: "completed",
    creditsUsed: 1,
    createdAt: "2024-11-28 09:20",
    wordCount: 320,
    engagement: 6.9,
  },
  {
    id: "5",
    title: "Blog Post - AI in Marketing",
    type: "blog",
    user: "david@freelance.com",
    status: "generating",
    creditsUsed: 5,
    createdAt: "2024-11-28 16:10",
    wordCount: 0,
    engagement: 0,
  },
]

const contentStats = {
  totalGenerated: 45672,
  todayGenerated: 234,
  avgWordsPerContent: 1250,
  topContentType: "Email",
  avgEngagementScore: 8.2,
  totalCreditsUsed: 89340,
}

const contentTypes = [
  { value: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
  { value: "ad", label: "Ad Copy", icon: Megaphone, color: "bg-green-500" },
  { value: "landing", label: "Landing Page", icon: Globe, color: "bg-purple-500" },
  { value: "social", label: "Social Posts", icon: MessageSquare, color: "bg-pink-500" },
  { value: "blog", label: "Blog Content", icon: PenTool, color: "bg-orange-500" },
  { value: "funnel", label: "Sales Funnel", icon: Workflow, color: "bg-indigo-500" },
]

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredContent = contentData.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.user.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || content.type === typeFilter
    const matchesStatus = statusFilter === "all" || content.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find((ct) => ct.value === type)
    if (!contentType) return <FileText className="h-4 w-4" />
    const Icon = contentType.icon
    return <Icon className="h-4 w-4" />
  }

  const getContentTypeBadge = (type: string) => {
    const contentType = contentTypes.find((ct) => ct.value === type)
    if (!contentType) return <Badge variant="outline">{type}</Badge>

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${contentType.color}`} />
        {contentType.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "generating":
        return <Badge variant="secondary">Generating</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Analytics</h1>
          <p className="text-muted-foreground">Monitor content generation and performance across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalGenerated.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +23.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.todayGenerated}</div>
            <p className="text-xs text-muted-foreground">Across all content types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.avgEngagementScore}/10</div>
            <p className="text-xs text-muted-foreground">Based on user feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Distribution</CardTitle>
          <CardDescription>Most popular content types generated this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {contentTypes.map((type) => (
              <div key={type.value} className="text-center">
                <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-xs text-muted-foreground">{Math.floor(Math.random() * 5000) + 1000} generated</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content ({filteredContent.length})</CardTitle>
          <CardDescription>Latest content generated across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getContentTypeIcon(content.type)}
                      <div>
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {content.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getContentTypeBadge(content.type)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{content.user}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{content.creditsUsed}</Badge>
                  </TableCell>
                  <TableCell>{content.wordCount > 0 ? content.wordCount.toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    {content.engagement > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{content.engagement}</span>
                        <span className="text-xs text-muted-foreground">/10</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{content.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Content
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContent.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
