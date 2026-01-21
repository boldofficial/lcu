"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Eye, Loader2, GraduationCap, Users, CheckCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Enrollment {
    id: string
    status: string
    enrollment_date: string
    expected_completion_date: string | null
    gpa: number
    credits_completed: number
    student: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
    program: {
        id: string
        name: string
        code: string
        total_credits: number
    }
}

interface Program {
    id: string
    name: string
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    withdrawn: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
}

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [selectedProgram, setSelectedProgram] = useState("all")

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const supabase = createClient()

        const [enrollmentsRes, programsRes] = await Promise.all([
            supabase
                .from("enrollments")
                .select(`
          *,
          student:profiles!enrollments_student_id_fkey(id, first_name, last_name, email),
          program:programs(id, name, code, total_credits)
        `)
                .order("enrollment_date", { ascending: false }),
            supabase.from("programs").select("id, name").eq("is_active", true)
        ])

        setEnrollments(enrollmentsRes.data || [])
        setPrograms(programsRes.data || [])
        setLoading(false)
    }

    const filteredEnrollments = enrollments.filter(enrollment => {
        const studentName = `${enrollment.student?.first_name} ${enrollment.student?.last_name}`.toLowerCase()
        const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
            enrollment.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = selectedStatus === "all" || enrollment.status === selectedStatus
        const matchesProgram = selectedProgram === "all" || enrollment.program?.id === selectedProgram
        return matchesSearch && matchesStatus && matchesProgram
    })

    const stats = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === "active").length,
        pending: enrollments.filter(e => e.status === "pending").length,
        completed: enrollments.filter(e => e.status === "completed").length,
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
                    <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
                    <p className="text-muted-foreground">Manage student program enrollments</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Enrollments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.active}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>All Enrollments</CardTitle>
                            <CardDescription>{filteredEnrollments.length} enrollments found</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    className="w-48 pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.map((program) => (
                                        <SelectItem key={program.id} value={program.id}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Enrolled Date</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>GPA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEnrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {enrollment.student?.first_name} {enrollment.student?.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{enrollment.program?.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {enrollment.credits_completed} / {enrollment.program?.total_credits}
                                                </span>
                                                <span className="text-xs text-muted-foreground">credits</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{enrollment.gpa?.toFixed(2) || "0.00"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[enrollment.status] || "bg-gray-100 text-gray-800"}>
                                                {enrollment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/students/${enrollment.student?.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Student
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredEnrollments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No enrollments found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
