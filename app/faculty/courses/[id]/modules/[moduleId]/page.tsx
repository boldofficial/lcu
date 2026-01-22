"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    Video,
    FileText,
    Headphones,
    FileQuestion,
    Save,
    Link as LinkIcon,
    ClipboardList
} from "lucide-react"
import { toast } from "sonner"
import { VideoPreview } from "@/components/lms/video-preview"
import { MarkdownEditor } from "@/components/lms/markdown-editor"
import { FileUploader, AttachmentList } from "@/components/lms/file-uploader"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createAssessment, toggleAssessmentPublish, deleteAssessment } from "@/app/actions/assignments"
import { getQuizQuestions, addQuizQuestion, deleteQuizQuestion, updateQuizQuestion } from "@/app/actions/quiz"
import { QuizQuestionEditor } from "@/components/lms/quiz-question-editor"
import type { AssessmentType, QuizQuestion } from "@/lib/types"

interface Attachment {
    name: string
    url: string
    type: string
}

interface Lesson {
    id: string
    title: string
    content: string
    content_type: "text" | "video" | "audio" | "document" | "interactive"
    video_url: string | null
    resource_url: string | null
    attachments: Attachment[] | null // Added for multiple files
    duration_minutes: number | null
    order_index: number
    is_published: boolean
}

interface Module {
    id: string
    title: string
    description: string
    order_index: number
    is_published: boolean
    course_id: string
    course?: { name: string; code: string }
    lessons?: Lesson[]
    assessments?: any[] // Using any for now to avoid large import refactor, or define Assessment interface if preferred
}

const contentTypeIcons: Record<string, React.ReactNode> = {
    text: <FileText className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    audio: <Headphones className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />, // Replaced redundant icon
    interactive: <FileQuestion className="h-4 w-4" />,
}

export default function ModuleEditorPage({
    params,
}: {
    params: Promise<{ id: string; moduleId: string }>
}) {
    const { id, moduleId } = use(params)
    const [module, setModule] = useState<Module | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [addLessonOpen, setAddLessonOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [lessonForm, setLessonForm] = useState({
        title: "",
        content: "",
        content_type: "text" as Lesson["content_type"],
        video_url: "",
        resource_url: "",
        attachments: [] as Attachment[],
        duration_minutes: 0,
    })
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    // Assessment dialog state
    const [addAssessmentOpen, setAddAssessmentOpen] = useState(false)
    const [editingAssessment, setEditingAssessment] = useState<any | null>(null)
    const [assessmentForm, setAssessmentForm] = useState({
        title: "",
        description: "",
        assessment_type: "assignment" as AssessmentType,
        total_points: 100,
        passing_score: 50,
        due_date: "",
        attachment_url: "",
        submission_type: "both" as "file" | "text" | "both",
        // Quiz-specific settings
        time_limit_minutes: null as number | null,
        shuffle_questions: false,
        show_feedback: true,
    })
    const [submittingAssessment, setSubmittingAssessment] = useState(false)

    // Quiz Editor state
    const [quizEditorOpen, setQuizEditorOpen] = useState(false)
    const [quizAssessmentId, setQuizAssessmentId] = useState<string | null>(null)
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const [addingQuestion, setAddingQuestion] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

    // Editable module fields
    const [moduleTitle, setModuleTitle] = useState("")
    const [moduleDescription, setModuleDescription] = useState("")

    useEffect(() => {
        fetchModule()
    }, [moduleId])

    async function fetchModule() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("modules")
            .select(`
        *,
        course:courses(name, code),
        lessons(*),
        assessments(*)
      `)
            .eq("id", moduleId)
            .single()

        if (error) {
            toast.error("Failed to load module")
            return
        }

        // Sort lessons by order_index
        if (data?.lessons) {
            data.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        }

        setModule(data)
        setModuleTitle(data.title)
        setModuleDescription(data.description || "")
        setLoading(false)
    }

    async function saveModuleDetails() {
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase
            .from("modules")
            .update({
                title: moduleTitle,
                description: moduleDescription,
            })
            .eq("id", moduleId)

        if (error) {
            toast.error("Failed to save module")
        } else {
            toast.success("Module saved!")
            fetchModule()
        }
        setSaving(false)
    }

    function openAddLesson() {
        setEditingLesson(null)
        setLessonForm({
            title: "",
            content: "",
            content_type: "text",
            video_url: "",
            resource_url: "",
            attachments: [],
            duration_minutes: 0,
        })
        setAddLessonOpen(true)
    }

    function openEditLesson(lesson: Lesson) {
        setEditingLesson(lesson)
        setLessonForm({
            title: lesson.title,
            content: lesson.content || "",
            content_type: lesson.content_type,
            video_url: lesson.video_url || "",
            resource_url: lesson.resource_url || "",
            attachments: lesson.attachments || [],
            duration_minutes: lesson.duration_minutes || 0,
        })
        setAddLessonOpen(true)
    }

    async function handleSaveLesson() {
        if (!lessonForm.title.trim()) {
            toast.error("Lesson title is required")
            return
        }

        setSubmitting(true)
        const supabase = createClient()

        if (editingLesson) {
            // Update existing lesson
            const { error } = await supabase
                .from("lessons")
                .update({
                    title: lessonForm.title,
                    content: lessonForm.content,
                    content_type: lessonForm.content_type,
                    video_url: lessonForm.video_url || null,
                    resource_url: lessonForm.resource_url || null,
                    attachments: lessonForm.attachments,
                    duration_minutes: lessonForm.duration_minutes || null,
                })
                .eq("id", editingLesson.id)

            if (error) {
                toast.error("Failed to update lesson")
            } else {
                toast.success("Lesson updated!")
                setAddLessonOpen(false)
                fetchModule()
            }
        } else {
            // Create new lesson
            const maxOrder = module?.lessons?.reduce((max, l) => Math.max(max, l.order_index), -1) ?? -1

            const { error } = await supabase.from("lessons").insert({
                module_id: moduleId,
                title: lessonForm.title,
                content: lessonForm.content,
                content_type: lessonForm.content_type,
                video_url: lessonForm.video_url || null,
                resource_url: lessonForm.resource_url || null,
                attachments: lessonForm.attachments,
                duration_minutes: lessonForm.duration_minutes || null,
                order_index: maxOrder + 1,
                is_published: false,
            })

            if (error) {
                toast.error("Failed to create lesson")
            } else {
                toast.success("Lesson created!")
                setAddLessonOpen(false)
                fetchModule()
            }
        }
        setSubmitting(false)
    }

    async function toggleLessonPublish(lessonId: string, currentStatus: boolean) {
        const supabase = createClient()
        const { error } = await supabase
            .from("lessons")
            .update({ is_published: !currentStatus })
            .eq("id", lessonId)

        if (error) {
            toast.error("Failed to update lesson")
        } else {
            toast.success(currentStatus ? "Lesson unpublished" : "Lesson published")
            fetchModule()
        }
    }

    async function deleteLesson(lessonId: string) {
        if (!confirm("Are you sure you want to delete this lesson?")) return

        const supabase = createClient()
        const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

        if (error) {
            toast.error("Failed to delete lesson")
        } else {
            toast.success("Lesson deleted")
            fetchModule()
        }
    }

    function openAddAssessment() {
        setEditingAssessment(null)
        setAssessmentForm({
            title: "",
            description: "",
            assessment_type: "assignment",
            total_points: 100,
            passing_score: 50,
            due_date: "",
            attachment_url: "",
            submission_type: "both",
            time_limit_minutes: null,
            shuffle_questions: false,
            show_feedback: true,
        })
        setAddAssessmentOpen(true)
    }

    function openEditAssessment(assessment: any) {
        setEditingAssessment(assessment)
        setAssessmentForm({
            title: assessment.title,
            description: assessment.description || "",
            assessment_type: assessment.assessment_type,
            total_points: assessment.total_points,
            passing_score: assessment.passing_score,
            due_date: assessment.due_date ? new Date(assessment.due_date).toISOString().slice(0, 16) : "",
            attachment_url: assessment.attachment_url || "",
            submission_type: assessment.submission_type || "both",
            time_limit_minutes: assessment.time_limit_minutes || null,
            shuffle_questions: assessment.shuffle_questions || false,
            show_feedback: assessment.show_correct_answers !== false,
        })
        setAddAssessmentOpen(true)
    }

    async function handleSaveAssessment() {
        if (!assessmentForm.title.trim()) {
            toast.error("Assessment title is required")
            return
        }

        setSubmittingAssessment(true)

        if (editingAssessment) {
            // Update using Supabase client directly since we don't have an update action yet
            // and it's consistent with lesson updates
            const supabase = createClient()
            const { error } = await supabase
                .from("assessments")
                .update({
                    title: assessmentForm.title,
                    description: assessmentForm.description || null,
                    assessment_type: assessmentForm.assessment_type,
                    total_points: assessmentForm.total_points,
                    passing_score: assessmentForm.passing_score,
                    due_date: assessmentForm.due_date || null,
                    attachment_url: assessmentForm.attachment_url || null,
                    submission_type: assessmentForm.submission_type,
                    time_limit_minutes: assessmentForm.time_limit_minutes,
                    shuffle_questions: assessmentForm.shuffle_questions,
                    show_correct_answers: assessmentForm.show_feedback,
                })
                .eq("id", editingAssessment.id)

            if (error) {
                toast.error("Failed to update assessment")
            } else {
                toast.success("Assessment updated!")
                setAddAssessmentOpen(false)
                fetchModule()
            }
        } else {
            // Create using server action
            const result = await createAssessment({
                course_id: id,
                module_id: moduleId,
                title: assessmentForm.title,
                description: assessmentForm.description || undefined,
                assessment_type: assessmentForm.assessment_type,
                total_points: assessmentForm.total_points,
                passing_score: assessmentForm.passing_score,
                due_date: assessmentForm.due_date || undefined,
                attachment_url: assessmentForm.attachment_url || undefined,
                submission_type: assessmentForm.submission_type,
                time_limit_minutes: assessmentForm.time_limit_minutes || undefined,
                shuffle_questions: assessmentForm.shuffle_questions,
                show_feedback: assessmentForm.show_feedback,
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Assessment created!")
                setAddAssessmentOpen(false)
                fetchModule()
            }
        }
        setSubmittingAssessment(false)
    }

    async function handleToggleAssessment(id: string, currentStatus: boolean) {
        const result = await toggleAssessmentPublish(id, currentStatus)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(currentStatus ? "Assessment unpublished" : "Assessment published")
            fetchModule()
        }
    }

    async function handleDeleteAssessment(id: string) {
        if (!confirm("Are you sure? All student submissions for this assessment will be deleted.")) return
        const result = await deleteAssessment(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Assessment deleted")
            fetchModule()
        }
    }

    async function openQuizEditor(assessmentId: string) {
        setQuizAssessmentId(assessmentId)
        setQuizEditorOpen(true)
        setLoadingQuestions(true)

        const result = await getQuizQuestions(assessmentId)
        if (result.error) {
            toast.error(result.error)
        } else {
            setQuizQuestions(result.data || [])
        }
        setLoadingQuestions(false)
    }

    async function handleAddQuestion(questionData: Omit<QuizQuestion, "id" | "created_at" | "updated_at">) {
        if (!quizAssessmentId) return

        const result = await addQuizQuestion({
            assessment_id: quizAssessmentId,
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            options: questionData.options,
            correct_answer_index: questionData.correct_answer_index,
            points: questionData.points,
            order_index: quizQuestions.length
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Question added!")
            setAddingQuestion(false)
            // Refresh questions
            const refreshed = await getQuizQuestions(quizAssessmentId)
            if (refreshed.data) setQuizQuestions(refreshed.data)
        }
    }

    async function handleDeleteQuestion(questionId: string) {
        if (!confirm("Delete this question?")) return

        const result = await deleteQuizQuestion(questionId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Question deleted")
            setQuizQuestions(prev => prev.filter(q => q.id !== questionId))
        }
    }

    async function handleEditQuestion(questionData: Omit<QuizQuestion, "id" | "created_at" | "updated_at">) {
        if (!editingQuestionId) return

        const result = await updateQuizQuestion(editingQuestionId, {
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            options: questionData.options,
            correct_answer_index: questionData.correct_answer_index,
            points: questionData.points
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Question updated!")
            setEditingQuestionId(null)
            // Refresh questions
            if (quizAssessmentId) {
                const refreshed = await getQuizQuestions(quizAssessmentId)
                if (refreshed.data) setQuizQuestions(refreshed.data)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!module) {
        return (
            <div className="flex h-96 flex-col items-center justify-center">
                <p className="text-muted-foreground">Module not found</p>
                <Link href={`/faculty/courses/${id}`}>
                    <Button variant="link">Back to course</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title={`Edit: ${module.title}`} />

            <div className="flex-1 space-y-6 p-6">
                {/* Back and Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/faculty/courses/${id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            {module.course?.code} - {module.course?.name}
                        </p>
                        <h1 className="text-2xl font-bold">Module Editor</h1>
                    </div>
                </div>

                {/* Module Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Module Details</CardTitle>
                        <CardDescription>Edit the module title and description</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="module-title">Title</Label>
                            <Input
                                id="module-title"
                                value={moduleTitle}
                                onChange={(e) => setModuleTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="module-desc">Description</Label>
                            <Textarea
                                id="module-desc"
                                value={moduleDescription}
                                onChange={(e) => setModuleDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <Button onClick={saveModuleDetails} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Module
                        </Button>
                    </CardContent>
                </Card>

                {/* Lessons Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Lessons</CardTitle>
                                <CardDescription>Add and manage lessons in this module</CardDescription>
                            </div>
                            <Button onClick={openAddLesson}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lesson
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {module.lessons && module.lessons.length > 0 ? (
                            <div className="space-y-3">
                                {module.lessons.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {contentTypeIcons[lesson.content_type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Lesson {index + 1}
                                                </span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {lesson.content_type}
                                                </Badge>
                                                <Badge variant={lesson.is_published ? "default" : "secondary"} className="text-xs">
                                                    {lesson.is_published ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <h4 className="font-semibold truncate">{lesson.title}</h4>
                                            {lesson.duration_minutes && (
                                                <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleLessonPublish(lesson.id, lesson.is_published)}
                                                title={lesson.is_published ? "Unpublish" : "Publish"}
                                            >
                                                {lesson.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)} title="Edit lesson">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteLesson(lesson.id)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete lesson"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No lessons yet</p>
                                <p className="text-sm text-muted-foreground">Add your first lesson to this module</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Lesson Dialog */}
                <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
                            <DialogDescription>
                                {editingLesson ? "Update lesson content" : "Create a new lesson for this module"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="lesson-title">Lesson Title</Label>
                                    <Input
                                        id="lesson-title"
                                        placeholder="e.g., Introduction to the Topic"
                                        value={lessonForm.title}
                                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        className="text-lg font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Content Type</Label>
                                    <Select
                                        value={lessonForm.content_type}
                                        onValueChange={(value) =>
                                            setLessonForm({ ...lessonForm, content_type: value as Lesson["content_type"] })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text / Article</SelectItem>
                                            <SelectItem value="video">Video Lesson</SelectItem>
                                            <SelectItem value="document">PDF / Document</SelectItem>
                                            <SelectItem value="audio">Audio Clip</SelectItem>
                                            <SelectItem value="interactive">Interactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="e.g., 15"
                                        value={lessonForm.duration_minutes || ""}
                                        onChange={(e) =>
                                            setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })
                                        }
                                    />
                                </div>
                            </div>

                            {lessonForm.content_type === "video" && (
                                <div className="space-y-4 rounded-lg bg-muted/50 p-4 border">
                                    <div className="space-y-2">
                                        <Label htmlFor="video-url" className="flex items-center gap-2">
                                            <Video className="h-4 w-4" />
                                            Video Source
                                        </Label>
                                        <Input
                                            id="video-url"
                                            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                            value={lessonForm.video_url}
                                            onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Paste a YouTube or Vimeo link. We will check it automatically.
                                        </p>
                                    </div>
                                    {lessonForm.video_url && <VideoPreview url={lessonForm.video_url} />}
                                </div>
                            )}

                            {lessonForm.content_type === "document" && (
                                <div className="space-y-4 rounded-lg bg-muted/50 p-4 border">
                                    <div className="flex flex-col gap-2">
                                        <Label className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4" />
                                            Attached Documents
                                        </Label>
                                        <div className="flex flex-col gap-4">
                                            <FileUploader
                                                onUploadComplete={(file) =>
                                                    setLessonForm(prev => ({ ...prev, attachments: [...prev.attachments, file] }))
                                                }
                                            />
                                            <AttachmentList
                                                attachments={lessonForm.attachments}
                                                onRemove={(index) =>
                                                    setLessonForm(prev => ({
                                                        ...prev,
                                                        attachments: prev.attachments.filter((_, i) => i !== index)
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="content">Lesson Content</Label>
                                <MarkdownEditor
                                    value={lessonForm.content}
                                    onChange={(val) => setLessonForm({ ...lessonForm, content: val })}
                                    placeholder="Write your lesson content here using Markdown..."
                                    rows={12}
                                />
                            </div>

                            {/* Optional Attachments for other types */}
                            {lessonForm.content_type !== "document" && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <LinkIcon className="h-3 w-3" />
                                        Additional Resources / Files
                                    </Label>
                                    <FileUploader
                                        onUploadComplete={(file) =>
                                            setLessonForm(prev => ({ ...prev, attachments: [...prev.attachments, file] }))
                                        }
                                    />
                                    <AttachmentList
                                        attachments={lessonForm.attachments}
                                        onRemove={(index) =>
                                            setLessonForm(prev => ({
                                                ...prev,
                                                attachments: prev.attachments.filter((_, i) => i !== index)
                                            }))
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddLessonOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveLesson} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingLesson ? "Update Lesson" : "Create Lesson"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Assessments Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Assessments</CardTitle>
                                <CardDescription>Add quizzes, assignments, or exams for this module</CardDescription>
                            </div>
                            <Button onClick={openAddAssessment}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Assessment
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>

                        {module.assessments && module.assessments.length > 0 ? (
                            <div className="space-y-3">
                                {module.assessments.map((assessment, index) => (
                                    <div
                                        key={assessment.id}
                                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {assessment.assessment_type === 'quiz' ? <FileQuestion className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {assessment.assessment_type}
                                                </Badge>
                                                <Badge variant={assessment.is_published ? "default" : "secondary"} className="text-xs">
                                                    {assessment.is_published ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <h4 className="font-semibold truncate">{assessment.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {assessment.total_points} pts • {assessment.due_date ? `Due ${new Date(assessment.due_date).toLocaleDateString()}` : "No due date"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {assessment.assessment_type === 'quiz' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openQuizEditor(assessment.id)}
                                                    title="Manage Questions"
                                                >
                                                    <FileQuestion className="mr-1 h-4 w-4" />
                                                    Questions
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleAssessment(assessment.id, assessment.is_published)}
                                                title={assessment.is_published ? "Unpublish" : "Publish"}
                                            >
                                                {assessment.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEditAssessment(assessment)} title="Edit assessment">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteAssessment(assessment.id)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete assessment"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No assessments yet</p>
                                <p className="text-sm text-muted-foreground">Create assignments, quizzes, or exams for students</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Assessment Dialog */}
                <Dialog open={addAssessmentOpen} onOpenChange={setAddAssessmentOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingAssessment ? "Edit Assessment" : "Create Assessment"}</DialogTitle>
                            <DialogDescription>
                                {editingAssessment ? "Update assessment details" : "Add a new quiz, assignment, or exam to this module"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="assessment-title">Title</Label>
                                    <Input
                                        id="assessment-title"
                                        placeholder="e.g., Week 1 Quiz"
                                        value={assessmentForm.title}
                                        onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={assessmentForm.assessment_type}
                                        onValueChange={(value) =>
                                            setAssessmentForm({ ...assessmentForm, assessment_type: value as AssessmentType })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assignment">Assignment</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Submission Type</Label>
                                    <Select
                                        value={assessmentForm.submission_type}
                                        onValueChange={(value) =>
                                            setAssessmentForm({ ...assessmentForm, submission_type: value as "file" | "text" | "both" })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="file">File Upload Only</SelectItem>
                                            <SelectItem value="text">Text / Essay Only</SelectItem>
                                            <SelectItem value="both">Both File & Text</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="total-points">Total Points</Label>
                                    <Input
                                        id="total-points"
                                        type="number"
                                        value={assessmentForm.total_points}
                                        onChange={(e) =>
                                            setAssessmentForm({ ...assessmentForm, total_points: parseInt(e.target.value) || 0 })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                                    <Input
                                        id="passing-score"
                                        type="number"
                                        value={assessmentForm.passing_score}
                                        onChange={(e) =>
                                            setAssessmentForm({ ...assessmentForm, passing_score: parseInt(e.target.value) || 0 })
                                        }
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="due-date">Due Date (Optional)</Label>
                                    <Input
                                        id="due-date"
                                        type="datetime-local"
                                        value={assessmentForm.due_date}
                                        onChange={(e) => setAssessmentForm({ ...assessmentForm, due_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Quiz-specific settings */}
                            {assessmentForm.assessment_type === 'quiz' && (
                                <div className="space-y-4 border-t pt-4">
                                    <h4 className="font-medium text-sm">Quiz Settings</h4>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                                            <Input
                                                id="time-limit"
                                                type="number"
                                                placeholder="No limit"
                                                value={assessmentForm.time_limit_minutes || ""}
                                                onChange={(e) =>
                                                    setAssessmentForm({
                                                        ...assessmentForm,
                                                        time_limit_minutes: e.target.value ? parseInt(e.target.value) : null
                                                    })
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">Leave empty for no time limit</p>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="shuffle-questions"
                                                checked={assessmentForm.shuffle_questions}
                                                onChange={(e) =>
                                                    setAssessmentForm({ ...assessmentForm, shuffle_questions: e.target.checked })
                                                }
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="shuffle-questions" className="text-sm font-normal">
                                                Shuffle questions
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="show-feedback"
                                                checked={assessmentForm.show_feedback}
                                                onChange={(e) =>
                                                    setAssessmentForm({ ...assessmentForm, show_feedback: e.target.checked })
                                                }
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="show-feedback" className="text-sm font-normal">
                                                Show correct answers after submission
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Instructions / Description</Label>
                                <RichTextEditor
                                    value={assessmentForm.description}
                                    onChange={(val) => setAssessmentForm({ ...assessmentForm, description: val })}
                                />
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label>Attachment (Optional)</Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Upload a question paper or instructions file (PDF, Word, etc.)
                                </p>
                                {assessmentForm.attachment_url ? (
                                    <div className="flex items-center gap-2 rounded-lg border p-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="flex-1 truncate text-sm">{assessmentForm.attachment_url.split('/').pop()}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAssessmentForm({ ...assessmentForm, attachment_url: "" })}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <FileUploader
                                        onUploadComplete={(file) => setAssessmentForm({ ...assessmentForm, attachment_url: file.url })}
                                        bucketName="assessments"
                                        folderPath="instructions"
                                    />
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddAssessmentOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveAssessment} disabled={submittingAssessment}>
                                {submittingAssessment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingAssessment ? "Update Assessment" : "Create Assessment"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Quiz Questions Editor Dialog */}
                <Dialog open={quizEditorOpen} onOpenChange={setQuizEditorOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Quiz Questions</DialogTitle>
                            <DialogDescription>
                                Add, edit, or remove questions for this quiz. Students will see these questions when taking the quiz.
                            </DialogDescription>
                        </DialogHeader>

                        {loadingQuestions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Existing Questions */}
                                {quizQuestions.length > 0 ? (
                                    <div className="space-y-3">
                                        {quizQuestions.map((question, index) => (
                                            editingQuestionId === question.id ? (
                                                <QuizQuestionEditor
                                                    key={question.id}
                                                    assessmentId={quizAssessmentId || ""}
                                                    existingQuestion={question}
                                                    onSave={handleEditQuestion}
                                                    onCancel={() => setEditingQuestionId(null)}
                                                />
                                            ) : (
                                                <Card key={question.id}>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary">Q{index + 1}</Badge>
                                                                <Badge variant="outline">{question.points} pt{question.points > 1 ? "s" : ""}</Badge>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingQuestionId(question.id)}
                                                                title="Edit question"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteQuestion(question.id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <CardTitle className="text-base">{question.question_text}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-1">
                                                            {question.options.map((option, optIndex) => (
                                                                <div
                                                                    key={optIndex}
                                                                    className={`text-sm px-3 py-1.5 rounded ${optIndex === question.correct_answer_index ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "text-muted-foreground"}`}
                                                                >
                                                                    {String.fromCharCode(65 + optIndex)}. {option}
                                                                    {optIndex === question.correct_answer_index && " ✓"}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No questions yet. Add your first question below.</p>
                                    </div>
                                )}

                                {/* Add Question Section */}
                                {addingQuestion ? (
                                    <QuizQuestionEditor
                                        assessmentId={quizAssessmentId || ""}
                                        onSave={handleAddQuestion}
                                        onCancel={() => setAddingQuestion(false)}
                                    />
                                ) : (
                                    <Button onClick={() => setAddingQuestion(true)} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setQuizEditorOpen(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
