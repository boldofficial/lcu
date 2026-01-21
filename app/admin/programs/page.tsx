"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, DollarSign, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddProgramModal } from "@/components/admin/add-program-modal"

interface Program {
  id: string
  name: string
  code: string
  description: string
  degree_type: string
  total_credits: number
  tuition_amount: number
  is_active: boolean
  courses?: { id: string }[]
  enrollments?: { id: string }[]
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  async function fetchPrograms() {
    const supabase = createClient()
    const { data } = await supabase
      .from("programs")
      .select(`
        *,
        courses(id),
        enrollments(id)
      `)
      .order("created_at", { ascending: false })

    setPrograms(data || [])
    setLoading(false)
  }

  const degreeTypeColors: Record<string, string> = {
    bachelor: "bg-blue-100 text-blue-800",
    master: "bg-purple-100 text-purple-800",
    doctorate: "bg-amber-100 text-amber-800",
    certificate: "bg-green-100 text-green-800",
    diploma: "bg-teal-100 text-teal-800",
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage degree programs and certificates</p>
        </div>
        <AddProgramModal />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs?.map((program) => (
          <Card key={program.id} className="relative overflow-hidden">
            <div className="absolute right-2 top-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Program
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1 pr-8">
                  <Badge className={degreeTypeColors[program.degree_type] || "bg-gray-100 text-gray-800"}>
                    {program.degree_type}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">{program.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{program.description}</p>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{program.courses?.length || 0} Courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{program.enrollments?.length || 0} Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{program.total_credits} Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${program.tuition_amount?.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={program.is_active ? "default" : "secondary"}>
                  {program.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!programs || programs.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
              No programs found. Create your first program to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
