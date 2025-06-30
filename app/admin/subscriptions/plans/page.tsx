"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  CreditCard,
  Users,
  Zap,
  CheckCircle,
  XCircle,
} from "lucide-react"

const subscriptionPlans = [
  {
    id: "plan_starter",
    name: "Starter",
    description: "Perfect for solo founders and small teams",
    price: 29,
    currency: "USD",
    interval: "month",
    credits: 50,
    seats: 1,
    features: [
      "50 AI generations per month",
      "All 6 content types",
      "PDF & DOCX export",
      "Email support",
      "Basic templates",
    ],
    isActive: true,
    stripePriceId: "price_starter_monthly",
    subscribers: 847,
    createdAt: "2024-01-01",
  },
  {
    id: "plan_growth",
    name: "Growth",
    description: "Ideal for growing teams and agencies",
    price: 79,
    currency: "USD",
    interval: "month",
    credits: 200,
    seats: 5,
    features: [
      "200 AI generations per month",
      "All 6 content types",
      "PDF & DOCX export",
      "Priority support",
      "Advanced templates",
      "Team collaboration",
      "Usage analytics",
    ],
    isActive: true,
    stripePriceId: "price_growth_monthly",
    subscribers: 1234,
    createdAt: "2024-01-01",
  },
  {
    id: "plan_scale",
    name: "Scale",
    description: "For established businesses and agencies",
    price: 199,
    currency: "USD",
    interval: "month",
    credits: 500,
    seats: 15,
    features: [
      "500 AI generations per month",
      "All 6 content types",
      "PDF & DOCX export",
      "Priority support",
      "Advanced templates",
      "Team collaboration",
      "Usage analytics",
      "API access",
      "Custom integrations",
      "White-label options",
    ],
    isActive: true,
    stripePriceId: "price_scale_monthly",
    subscribers: 456,
    createdAt: "2024-01-01",
  },
]

export default function SubscriptionPlansPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    credits: "",
    seats: "",
    features: [""],
    isActive: true,
  })

  const handleCreatePlan = () => {
    // TODO: Implement plan creation API call
    console.log("Creating plan:", planForm)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdatePlan = () => {
    // TODO: Implement plan update API call
    console.log("Updating plan:", editingPlan.id, planForm)
    setEditingPlan(null)
    resetForm()
  }

  const handleDeletePlan = (planId: string) => {
    // TODO: Implement plan deletion API call
    console.log("Deleting plan:", planId)
  }

  const handleTogglePlanStatus = (planId: string) => {
    // TODO: Implement plan status toggle
    console.log("Toggling plan status:", planId)
  }

  const resetForm = () => {
    setPlanForm({
      name: "",
      description: "",
      price: "",
      credits: "",
      seats: "",
      features: [""],
      isActive: true,
    })
  }

  const addFeature = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, ""],
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...planForm.features]
    newFeatures[index] = value
    setPlanForm({
      ...planForm,
      features: newFeatures,
    })
  }

  const removeFeature = (index: number) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.filter((_, i) => i !== index),
    })
  }

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      credits: plan.credits.toString(),
      seats: plan.seats.toString(),
      features: [...plan.features],
      isActive: plan.isActive,
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans, pricing, and features</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>Create a new subscription plan with custom pricing and features</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Professional"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="99"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the plan..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credits">Monthly Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="100"
                    value={planForm.credits}
                    onChange={(e) => setPlanForm({ ...planForm, credits: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Team Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    placeholder="3"
                    value={planForm.seats}
                    onChange={(e) => setPlanForm({ ...planForm, seats: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Features</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter feature description"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                      />
                      {planForm.features.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={planForm.isActive}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
                />
                <Label htmlFor="isActive">Plan is active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.isActive ? "opacity-60" : ""}`}>
            {!plan.isActive && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">Inactive</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePlanStatus(plan.id)}>
                      {plan.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{plan.credits}</div>
                  <div className="text-xs text-muted-foreground">Credits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{plan.seats}</div>
                  <div className="text-xs text-muted-foreground">Seats</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{plan.subscribers}</div>
                  <div className="text-xs text-muted-foreground">Subscribers</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-muted-foreground">+{plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground">
                  Stripe Price ID: <code className="bg-muted px-1 rounded">{plan.stripePriceId}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>Detailed view of all subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">{plan.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${plan.price}/{plan.interval}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Zap className="h-3 w-3" />
                      {plan.credits}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Users className="h-3 w-3" />
                      {plan.seats}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{plan.subscribers.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {plan.isActive ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(plan.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="h-4 w-4 mr-2" />
                          View in Stripe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>Update plan details, pricing, and features</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Plan Name</Label>
                <Input
                  id="editName"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPrice">Price (USD)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCredits">Monthly Credits</Label>
                <Input
                  id="editCredits"
                  type="number"
                  value={planForm.credits}
                  onChange={(e) => setPlanForm({ ...planForm, credits: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editSeats">Team Seats</Label>
                <Input
                  id="editSeats"
                  type="number"
                  value={planForm.seats}
                  onChange={(e) => setPlanForm({ ...planForm, seats: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {planForm.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter feature description"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                    />
                    {planForm.features.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editIsActive"
                checked={planForm.isActive}
                onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
              />
              <Label htmlFor="editIsActive">Plan is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
