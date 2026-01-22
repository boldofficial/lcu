"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import DOMPurify from "isomorphic-dompurify"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, FileText, Clock, CheckCircle, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import type { Lesson } from "@/lib/types"

import { startTransition, useTransition } from "react"
import { markLessonComplete } from "@/app/actions/lms"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { VideoPreview } from "@/components/lms/video-preview"

// Enhanced Lesson Type that's compatible with base Lesson
interface EnhancedLesson extends Omit<Lesson, "content" | "video_url"> {
  content: string | null
  resource_url?: string | null
  video_url: string | null
}

interface LessonViewerProps {
  lesson: EnhancedLesson
  courseId: string
  isCompleted: boolean
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function LessonViewer({
  lesson,
  courseId,
  isCompleted,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: LessonViewerProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkComplete() {
    startTransition(async () => {
      const result = await markLessonComplete(lesson.id, courseId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Lesson completed!")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {lesson.content_type === "video" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{lesson.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {lesson.content_type}
              </Badge>
              {lesson.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration_minutes} minutes
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant={isCompleted ? "outline" : "default"}
          size="sm"
          onClick={handleMarkComplete}
          disabled={isPending || isCompleted}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className={`mr-2 h-4 w-4 ${isCompleted ? "text-primary" : ""}`} />
          )}
          {isCompleted ? "Completed" : "Mark Complete"}
        </Button>
      </div>

      {/* Video Player */}
      {lesson.content_type === "video" && lesson.video_url && (
        <Card>
          <CardContent className="p-0">
            <VideoPreview url={lesson.video_url} />
          </CardContent>
        </Card>
      )}

      {/* Text Content */}
      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Sample Content for Demo */}
      {!lesson.content && lesson.content_type === "text" && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p>
                This lesson covers important foundational concepts that will prepare you for deeper study in this
                course. Take your time to read through the material carefully and reflect on how these principles apply
                to your spiritual journey.
              </p>
              <h3>Key Concepts</h3>
              <ul>
                <li>Understanding the historical context</li>
                <li>Analyzing the theological significance</li>
                <li>Applying scriptural truths to daily life</li>
                <li>Engaging with primary source materials</li>
              </ul>
              <h3>Scripture Reference</h3>
              <blockquote>
                "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in
                righteousness, so that the servant of God may be thoroughly equipped for every good work." — 2 Timothy
                3:16-17 (NIV)
              </blockquote>
              <h3>Reflection Questions</h3>
              <ol>
                <li>How does this lesson connect to what you already know about the subject?</li>
                <li>What new insights have you gained?</li>
                <li>How might you apply these principles in your ministry or daily life?</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Lesson
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasNext}
        >
          Next Lesson
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
