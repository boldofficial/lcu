"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Pencil, Eye, Copy, Loader2, BookOpen, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddCourseModal } from "@/components/admin/add-course-modal"
import { EditCourseModal } from "@/components/admin/edit-course-modal"
import { toast } from "sonner"

interface Course {
  id: string
  name: string
  code: string
  description: string
  credits: number
  duration_weeks: number
  is_active: boolean
  program_id: string | null
  instructor_id: string | null
  program?: { id: string; name: string }
  instructor?: { id: string; first_name: string; last_name: string }
}

interface Program {
  id: string
  name: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("all")
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const [coursesRes, programsRes] = await Promise.all([
      supabase
        .from("courses")
        .select(`
          *,
          program:programs(id, name),
          instructor:profiles(id, first_name, last_name)
        `)
        .order("code", { ascending: true }),
      supabase.from("programs").select("id, name").eq("is_active", true)
    ])

    setCourses(coursesRes.data || [])
    setPrograms(programsRes.data || [])
    setLoading(false)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProgram = selectedProgram === "all" || course.program?.name === selectedProgram
    return matchesSearch && matchesProgram
  })

  function handleEdit(course: Course) {
    setEditingCourse(course)
    setEditModalOpen(true)
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Are you sure you want to deactivate ${course.code} - ${course.name}?`)) return

    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to deactivate course")
      }

      toast.success("Course deactivated")
      fetchData()
    } catch (error) {
      toast.error("Failed to deactivate course")
    }
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage courses and curriculum content</p>
        </div>
        <AddCourseModal />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs?.map((program) => (
              <SelectItem key={program.id} value={program.name}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className={`relative overflow-hidden hover:shadow-md transition-shadow ${!course.is_active ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{course.code}</p>
                    <CardTitle className="text-base leading-tight truncate">{course.name}</CardTitle>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(course)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(course)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {course.program?.name || "Unassigned"}
                </Badge>
                <Badge variant={course.is_active ? "default" : "secondary"} className="text-xs">
                  {course.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{course.credits}</strong> Credits
                  </span>
                </div>
                <span className="text-muted-foreground truncate max-w-[150px]">
                  {course.instructor
                    ? `${course.instructor.first_name} ${course.instructor.last_name}`
                    : "No instructor"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
            {searchQuery || selectedProgram !== "all"
              ? "No courses match your filters."
              : "No courses found. Add your first course to get started."}
          </CardContent>
        </Card>
      )}

      <EditCourseModal
        course={editingCourse}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchData}
      />
    </div>
  )
}
