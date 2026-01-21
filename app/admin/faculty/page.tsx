"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, BookOpen, MoreHorizontal, Pencil, Eye, Loader2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AddFacultyModal } from "@/components/admin/add-faculty-modal"
import { EditFacultyModal } from "@/components/admin/edit-faculty-modal"
import { toast } from "sonner"

interface FacultyMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  bio: string | null
  is_active: boolean
  courses?: { id: string; name: string; code: string }[]
}

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    fetchFaculty()
  }, [])

  async function fetchFaculty() {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select(`
        *,
        courses:courses!courses_instructor_id_fkey(id, name, code)
      `)
      .eq("role", "faculty")
      .order("last_name", { ascending: true })

    setFaculty(data || [])
    setLoading(false)
  }

  const filteredFaculty = faculty.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  function handleEdit(member: FacultyMember) {
    setEditingFaculty(member)
    setEditModalOpen(true)
  }

  async function handleDelete(member: FacultyMember) {
    if (!confirm(`Are you sure you want to deactivate ${member.first_name} ${member.last_name}?`)) return

    try {
      const response = await fetch(`/api/admin/faculty/${member.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to deactivate faculty member")
      }

      toast.success("Faculty member deactivated")
      fetchFaculty()
    } catch (error) {
      toast.error("Failed to deactivate faculty member")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
          <p className="text-muted-foreground">Manage instructors and course assignments</p>
        </div>
        <AddFacultyModal />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search faculty..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty?.map((member) => (
          <Card key={member.id} className={!member.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                    {member.first_name?.[0]}
                    {member.last_name?.[0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                    {!member.is_active && (
                      <Badge variant="secondary" className="mt-1">Inactive</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(member)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(member)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Courses Assigned</span>
                  <Badge variant="secondary">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {member.courses?.length || 0}
                  </Badge>
                </div>
                {member.courses && member.courses.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Teaching:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.courses.slice(0, 3).map((course) => (
                        <Badge key={course.id} variant="outline" className="text-xs">
                          {course.code}
                        </Badge>
                      ))}
                      {member.courses.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.courses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredFaculty.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
              {searchQuery ? "No faculty members match your search." : "No faculty members found. Add your first instructor to get started."}
            </CardContent>
          </Card>
        )}
      </div>

      <EditFacultyModal
        faculty={editingFaculty}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchFaculty}
      />
    </div>
  )
}
