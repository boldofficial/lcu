"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    GraduationCap,
    Clock,
    Loader2,
    MoreHorizontal,
    Shield
} from "lucide-react"
import type { Profile, Enrollment, CourseEnrollment } from "@/lib/types"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function StudentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [student, setStudent] = useState<Profile | null>(null)
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStudentData()
    }, [id])

    async function fetchStudentData() {
        const supabase = createClient()

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single()

        if (profileError) {
            toast.error("Failed to load student profile")
            return
        }

        setStudent(profileData as Profile)

        // 2. Fetch Program Enrollments
        const { data: enrollmentsData } = await supabase
            .from("enrollments")
            .select(`
                *,
                program:programs(*)
            `)
            .eq("student_id", id)
            .order("created_at", { ascending: false })

        if (enrollmentsData) {
            setEnrollments(enrollmentsData as Enrollment[])

            // 3. Fetch Course Enrollments if there are program enrollments
            if (enrollmentsData.length > 0) {
                // We need to fetch course enrollments for all these enrollments
                // Ideally we join, but let's query directly via student_id if schema supports it 
                // Or map through enrollments locally. 
                // Looking at types, CourseEnrollment usually has enrollment_id.

                // Let's check course_enrollments table
                const { data: courseData } = await supabase
                    .from("course_enrollments")
                    .select(`
                       *,
                       course:courses(*)
                   `)
                    .eq("student_id", id)
                    .order("created_at", { ascending: false })

                if (courseData) setCourseEnrollments(courseData as CourseEnrollment[])
            }
        }

        setLoading(false)
    }

    if (loading || !student) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const activeEnrollment = enrollments.find(e => e.status === 'active')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/students">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {student.first_name} {student.last_name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Student ID: {id.slice(0, 8).toUpperCase()}</span>
                            <span>•</span>
                            <Badge variant={student.is_active ? "default" : "secondary"}>
                                {student.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                {student.is_active ? "Suspend Account" : "Activate Account"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Email</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Phone</p>
                                    <p className="text-sm text-muted-foreground">{student.phone || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        {student.address ? (
                                            <>
                                                {student.address}<br />
                                                {student.city}, {student.state} {student.zip_code}<br />
                                                {student.country}
                                            </>
                                        ) : "Not provided"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">DOB</p>
                                    <p className="text-sm text-muted-foreground">
                                        {student.date_of_birth ? format(new Date(student.date_of_birth), "PPP") : "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Role</p>
                                    <p className="text-sm text-muted-foreground capitalize">{student.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Joined</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(student.created_at), "PPP")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Program</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeEnrollment ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{activeEnrollment.program?.name}</h3>
                                        <p className="text-sm text-muted-foreground">{activeEnrollment.program?.degree_type} Degree</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <Badge>{activeEnrollment.status}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Enrolled Date</p>
                                            <p>{format(new Date(activeEnrollment.enrollment_date), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Credits Earned</p>
                                            <p>{activeEnrollment.credits_completed} / {activeEnrollment.program?.total_credits}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">GPA</p>
                                            <p>{activeEnrollment.gpa.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-lg border-dashed border-2">
                                    <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No active program enrollment</p>
                                    <Button variant="link" asChild>
                                        <Link href="/admin/enrollments">Enroll Student</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="courses">
                        <TabsList>
                            <TabsTrigger value="courses">Courses</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="courses" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Enrollments</CardTitle>
                                    <CardDescription>
                                        History of all courses taken by this student
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {courseEnrollments.length > 0 ? (
                                        <div className="space-y-4">
                                            {courseEnrollments.map((ce) => (
                                                <div key={ce.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="font-medium">{ce.course?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{ce.course?.code} • {ce.course?.credits} Credits</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={
                                                            ce.status === 'completed' ? 'default' :
                                                                ce.status === 'failed' ? 'destructive' : 'outline'
                                                        }>
                                                            {ce.status}
                                                        </Badge>
                                                        <p className="text-sm font-medium mt-1">
                                                            {ce.grade ? `Grade: ${ce.grade}` : `${ce.progress_percentage}%`}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No course records found.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrollment History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {enrollments.length > 0 ? (
                                        <div className="space-y-4">
                                            {enrollments.map((en) => (
                                                <div key={en.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="font-medium">{en.program?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{format(new Date(en.enrollment_date), "MMM yyyy")}</p>
                                                    </div>
                                                    <Badge variant="outline">{en.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No enrollment history.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
