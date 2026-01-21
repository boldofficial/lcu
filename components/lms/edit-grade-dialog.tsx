"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface EditGradeDialogProps {
    studentId: string
    courseId: string
    currentGrade: string | null
    studentName: string
    courseName: string
}

export function EditGradeDialog({
    studentId,
    courseId,
    currentGrade,
    studentName,
    courseName,
}: EditGradeDialogProps) {
    const [open, setOpen] = useState(false)
    const [grade, setGrade] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleOpen = () => {
        setGrade(currentGrade || "")
        setOpen(true)
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // Calculate grade points and percentage roughly based on grade letter
            // or we just update the letter grade. 
            // Ideally, the faculty should input a percentage or point value, but the Gradebook shows letter grades.
            // Let's assume input is Letter Grade for now as that what matches the schema/view.

            const { error } = await supabase
                .from("course_enrollments")
                .update({
                    grade: grade,
                    grade_points: calculateGradePoints(grade),
                    updated_at: new Date().toISOString()
                })
                .match({ student_id: studentId, course_id: courseId })

            if (error) throw error

            toast.success("Grade updated successfully")
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to update grade: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    function calculateGradePoints(letter: string): number {
        const map: Record<string, number> = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0
        }
        return map[letter.toUpperCase()] || 0.0
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={handleOpen}>
                    Edit Grade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Grade</DialogTitle>
                    <DialogDescription>
                        Update the final grade for {studentName} in {courseName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grade" className="text-right">
                            Grade
                        </Label>
                        <Input
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. A, B+, C"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Grade"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
