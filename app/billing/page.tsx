"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Zap, Download, ExternalLink, Check, Clock, AlertCircle } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "month",
    credits: 50,
    seats: 1,
    features: ["50 AI generations per month", "All 6 content types", "PDF & DOCX export", "Email support"],
    current: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "month",
    credits: 200,
    seats: 5,
    features: [
      "200 AI generations per month",
      "All 6 content types",
      "PDF & DOCX export",
      "Priority support",
      "Team collaboration",
      "Usage analytics",
    ],
    current: true,
  },
  {
    name: "Scale",
    price: "$199",
    period: "month",
    credits: 500,
    seats: 15,
    features: [
      "500 AI generations per month",
      "All 6 content types",
      "PDF & DOCX export",
      "Priority support",
      "Team collaboration",
      "Usage analytics",
      "API access",
      "Custom integrations",
    ],
    current: false,
  },
]

const billingHistory = [
  {
    id: "inv_001",
    date: "Nov 15, 2024",
    description: "Growth Plan - Monthly",
    amount: "$79.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv_002",
    date: "Oct 15, 2024",
    description: "Growth Plan - Monthly",
    amount: "$79.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv_003",
    date: "Sep 15, 2024",
    description: "Starter Plan - Monthly",
    amount: "$29.00",
    status: "Paid",
    downloadUrl: "#",
  },
]

export default function BillingPage() {
  const [currentPlan] = useState({
    name: "Growth",
    price: 79,
    nextBilling: "Dec 15, 2024",
    status: "active",
  })

  const [credits] = useState({
    used: 145,
    total: 200,
    resetDate: "Dec 1, 2024",
  })

  const [paymentMethod] = useState({
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiryMonth: 12,
    expiryYear: 2025,
  })

  const creditPercentage = (credits.used / credits.total) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, usage, and billing information</p>
        </div>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          Customer Portal
        </Button>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{currentPlan.name}</div>
                <div className="text-muted-foreground">${currentPlan.price}/month</div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="font-medium">{currentPlan.nextBilling}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment method</span>
                <span className="font-medium">•••• {paymentMethod.last4}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                Change Plan
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                Update Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Credit Usage
            </CardTitle>
            <CardDescription>Your monthly credit consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{credits.used}</div>
              <div className="text-muted-foreground">of {credits.total} credits used</div>
            </div>

            <Progress value={creditPercentage} className="h-3" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credits remaining</span>
              <span className="font-medium">{credits.total - credits.used}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Resets on {credits.resetDate}</span>
            </div>

            {creditPercentage > 80 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700 dark:text-orange-300">
                  You're running low on credits. Consider upgrading your plan.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border rounded-lg p-6 ${plan.current ? "border-primary bg-primary/5" : ""}`}
              >
                {plan.current && <Badge className="absolute -top-2 left-4">Current Plan</Badge>}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {plan.credits} credits • {plan.seats} seat{plan.seats > 1 ? "s" : ""}
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.date}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="default">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
