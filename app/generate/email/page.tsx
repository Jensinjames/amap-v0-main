"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, ArrowLeft, Zap, Copy, Download, RefreshCw, Sparkles, Clock } from "lucide-react"
import Link from "next/link"

const emailTypes = [
  { value: "welcome", label: "Welcome Series" },
  { value: "nurture", label: "Nurture Campaign" },
  { value: "product-launch", label: "Product Launch" },
  { value: "re-engagement", label: "Re-engagement" },
  { value: "abandoned-cart", label: "Abandoned Cart" },
  { value: "onboarding", label: "User Onboarding" },
]

const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "empathetic", label: "Empathetic" },
]

const sequenceLengths = [
  { value: "3", label: "3 emails" },
  { value: "5", label: "5 emails" },
  { value: "7", label: "7 emails" },
  { value: "10", label: "10 emails" },
]

export default function EmailGeneratorPage() {
  const [formData, setFormData] = useState({
    emailType: "",
    companyName: "",
    productService: "",
    targetAudience: "",
    tone: "",
    sequenceLength: "",
    additionalContext: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [credits] = useState({ used: 45, total: 200 })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    // TODO: Implement actual AI generation with OpenAI API
    // This would call a Supabase Edge Function
    setTimeout(() => {
      setGeneratedContent({
        emails: [
          {
            subject: "Welcome to [Company Name] - Let's get started!",
            content: `Hi [First Name],

Welcome to [Company Name]! We're thrilled to have you join our community of [target audience].

Over the next few days, I'll be sharing some valuable insights to help you get the most out of [product/service]. 

Here's what you can expect:
• Day 1: Getting started guide
• Day 3: Pro tips and best practices  
• Day 5: Success stories from customers like you

Ready to dive in? Click here to access your welcome guide: [CTA Button]

Best regards,
[Your Name]
[Company Name]

P.S. Have questions? Just reply to this email - I read every single one!`,
          },
          {
            subject: "Quick question about your goals...",
            content: `Hi [First Name],

Yesterday I sent you our welcome guide. I hope you found it helpful!

I wanted to reach out personally because I'm curious - what's your biggest challenge when it comes to [relevant topic]?

I ask because understanding your specific situation helps me share the most relevant tips and strategies.

Would you mind hitting reply and letting me know? It'll just take 30 seconds, and I promise to send you something valuable in return.

Looking forward to hearing from you!

[Your Name]
[Company Name]`,
          },
        ],
        metadata: {
          generatedAt: new Date().toISOString(),
          creditsUsed: 3,
          estimatedReadTime: "2-3 minutes per email",
        },
      })
      setIsGenerating(false)
    }, 3000)
  }

  const canGenerate =
    formData.emailType &&
    formData.companyName &&
    formData.productService &&
    formData.targetAudience &&
    formData.tone &&
    formData.sequenceLength

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/generate">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to generators
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Email Sequence Generator</h1>
            <p className="text-muted-foreground">Create converting email campaigns and drip sequences</p>
          </div>
        </div>
        <Badge variant="outline" className="ml-auto">
          <Zap className="h-3 w-3 mr-1" />3 credits
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Email Sequence Details</CardTitle>
            <CardDescription>
              Provide information about your email campaign to generate personalized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailType">Email Type</Label>
                <Select value={formData.emailType} onValueChange={(value) => handleInputChange("emailType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequenceLength">Sequence Length</Label>
                <Select
                  value={formData.sequenceLength}
                  onValueChange={(value) => handleInputChange("sequenceLength", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    {sequenceLengths.map((length) => (
                      <SelectItem key={length.value} value={length.value}>
                        {length.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Acme Corp"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productService">Product/Service</Label>
              <Input
                id="productService"
                placeholder="e.g., SaaS project management tool"
                value={formData.productService}
                onChange={(e) => handleInputChange("productService", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Small business owners, Marketing managers"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange("tone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
              <Textarea
                id="additionalContext"
                placeholder="Any specific requirements, brand guidelines, or key messages..."
                value={formData.additionalContext}
                onChange={(e) => handleInputChange("additionalContext", e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating || credits.total - credits.used < 3}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Email Sequence...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Email Sequence
                </>
              )}
            </Button>

            {credits.total - credits.used < 3 && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Insufficient credits. You need 3 credits to generate an email sequence.
                </p>
                <Link href="/billing">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Email Sequence</CardTitle>
            <CardDescription>
              {generatedContent ? "Your AI-generated email sequence is ready" : "Generated content will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedContent && !isGenerating && (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to generate</h3>
                <p className="text-muted-foreground">
                  Fill out the form and click generate to create your email sequence
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Generating your email sequence</h3>
                <p className="text-muted-foreground">This may take a few moments...</p>
              </div>
            )}

            {generatedContent && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {generatedContent.metadata.estimatedReadTime}
                    </Badge>
                    <Badge variant="outline">{generatedContent.emails.length} emails</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {generatedContent.emails.map((email: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Email {index + 1}</h4>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">SUBJECT LINE</Label>
                          <p className="font-medium">{email.subject}</p>
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-xs text-muted-foreground">EMAIL CONTENT</Label>
                          <div className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-line">{email.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
