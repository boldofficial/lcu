"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, Eye, Ban, Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { deleteStudent, toggleStudentStatus } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

interface StudentActionsProps {
    studentId: string
    isActive: boolean
    email: string
}

export function StudentActions({ studentId, isActive, email }: StudentActionsProps) {
    const router = useRouter()

    async function handleToggleStatus() {
        const result = await toggleStudentStatus(studentId, !isActive)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(isActive ? "Student suspended" : "Student activated")
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return

        const result = await deleteStudent(studentId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Student deleted")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/admin/students/${studentId}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = `mailto:${email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                    {isActive ? (
                        <>
                            <Ban className="mr-2 h-4 w-4 text-orange-500" />
                            <span className="text-orange-500">Suspend Account</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-500">Activate Account</span>
                        </>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Delete Account</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
