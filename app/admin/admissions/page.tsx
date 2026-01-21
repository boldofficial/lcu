"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Search, Filter, Eye, Loader2 } from "lucide-react"
import type { Application } from "@/lib/types"

export default function AdmissionsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const router = useRouter()

    useEffect(() => {
        fetchApplications()
    }, [])

    async function fetchApplications() {
        const supabase = createClient()
        const { data } = await supabase
            .from("applications")
            .select(`
        *,
        program:programs(name)
      `)
            .order("created_at", { ascending: false })

        if (data) {
            setApplications(data as Application[])
        }
        setLoading(false)
    }

    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            app.applicant_email.toLowerCase().includes(search.toLowerCase()) ||
            app.applicant_first_name.toLowerCase().includes(search.toLowerCase()) ||
            app.applicant_last_name.toLowerCase().includes(search.toLowerCase())

        const matchesStatus = statusFilter === "all" || app.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        under_review: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        waitlisted: "bg-orange-100 text-orange-800",
        enrolled: "bg-purple-100 text-purple-800",
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
                    <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
                    <p className="text-muted-foreground">
                        Manage student applications and admissions decisions
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Applications</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search applicants..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No applications found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {app.applicant_first_name} {app.applicant_last_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {app.applicant_email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{app.program?.name || "No Program Selected"}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={statusColors[app.status]}
                                                >
                                                    {app.status.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={`/admin/admissions/${app.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
