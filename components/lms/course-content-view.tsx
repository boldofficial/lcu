"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Play, CheckCircle, FileText, Video, GraduationCap, MessageSquare, ClipboardList, ArrowLeft, Loader2 } from "lucide-react"
import type { Course, CourseEnrollment, Module, Lesson, Assessment, QuizQuestion } from "@/lib/types"
import { LessonViewer } from "./lesson-viewer"
import { AssessmentCard } from "./assessment-card"
import { AssignmentView } from "./assignment-view"
import { QuizTaker } from "./quiz-taker"
import { getQuizQuestions } from "@/app/actions/quiz"

interface CourseContentViewProps {
  course: Course & { modules: (Module & { lessons: Lesson[] })[] }
  enrollment: CourseEnrollment | null
  assessments: Assessment[]
  submissions: any[]
  lessonProgress: { lesson_id: string; status: string; completed_at: string | null }[]
}

export function CourseContentView({ course, enrollment, assessments, submissions, lessonProgress }: CourseContentViewProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [activeTab, setActiveTab] = useState("content")

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = lessonProgress.filter(p => p.status === 'completed').length

  // Create a Set of completed lesson IDs for O(1) lookup
  const completedLessonIds = new Set(lessonProgress.filter(p => p.status === 'completed').map(p => p.lesson_id))

  // Flatten all lessons for navigation
  const allLessons = course.modules.flatMap(m => m.lessons)
  const currentLessonIndex = selectedLesson ? allLessons.findIndex(l => l.id === selectedLesson.id) : -1
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
  const hasPreviousLesson = currentLessonIndex > 0

  const goToNextLesson = () => {
    if (hasNextLesson) {
      setSelectedLesson(allLessons[currentLessonIndex + 1])
    }
  }

  const goToPreviousLesson = () => {
    if (hasPreviousLesson) {
      setSelectedLesson(allLessons[currentLessonIndex - 1])
    }
  }

  // Fetch quiz questions when a quiz assessment is selected
  useEffect(() => {
    if (selectedAssessment && selectedAssessment.assessment_type === 'quiz') {
      setLoadingQuiz(true)
      getQuizQuestions(selectedAssessment.id).then((result) => {
        if (result.data) {
          setQuizQuestions(result.data as QuizQuestion[])
        }
        setLoadingQuiz(false)
      })
    } else {
      setQuizQuestions([])
    }
  }, [selectedAssessment])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - Course Navigation */}
      <aside className="hidden w-80 flex-col border-r bg-card lg:flex">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.code}</Badge>
            <Badge>{course.credits} Credits</Badge>
          </div>
          <h2 className="mt-2 font-semibold">{course.name}</h2>
          {course.instructor && (
            <p className="mt-1 text-sm text-muted-foreground">
              {course.instructor.first_name} {course.instructor.last_name}
            </p>
          )}
        </div>

        <div className="border-b p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Course Progress</span>
            <span className="font-medium">{Math.round((completedLessons / (totalLessons || 1)) * 100)}%</span>
          </div>
          <Progress value={(completedLessons / (totalLessons || 1)) * 100} className="mt-2 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)} className="space-y-2">
              {course.modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-2">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-left">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {moduleIndex + 1}
                      </span>
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pb-2">
                      {/* Lessons */}
                      {module.lessons.map((lesson) => (
                        <button
                          key={`lesson-${lesson.id}`}
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setActiveTab("content")
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted ${selectedLesson?.id === lesson.id && activeTab === 'content' ? "bg-muted" : ""
                            }`}
                        >
                          {lesson.content_type === "video" ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FileText className={`h-4 w-4 ${completedLessonIds.has(lesson.id) ? "text-primary" : "text-muted-foreground"}`} />
                          )}
                          <span className={`flex-1 truncate ${completedLessonIds.has(lesson.id) ? "font-medium" : ""}`}>{lesson.title}</span>
                          {completedLessonIds.has(lesson.id) && <CheckCircle className="h-3 w-3 text-primary" />}
                          {lesson.duration_minutes && (
                            <span className="text-xs text-muted-foreground">{lesson.duration_minutes}m</span>
                          )}
                        </button>
                      ))}

                      {/* Assessments attached to this module */}
                      {assessments.filter(a => a.module_id === module.id).map((assessment) => (
                        <button
                          key={`assessment-${assessment.id}`}
                          onClick={() => {
                            setSelectedAssessment(assessment)
                            setActiveTab("assessments")
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted ${selectedAssessment?.id === assessment.id && activeTab === 'assessments' ? "bg-muted" : ""
                            }`}
                        >
                          <ClipboardList className="h-4 w-4 text-orange-500" />
                          <span className="flex-1 truncate">{assessment.title}</span>
                          <Badge variant="outline" className="text-[10px] px-1 h-5">
                            {assessment.assessment_type}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <div className="border-b bg-card px-6">
            <TabsList className="h-12">
              <TabsTrigger value="content" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Assessments ({assessments.length})
              </TabsTrigger>
              <TabsTrigger value="discussions" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Course Info
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="flex-1 m-0 p-6">
            {selectedLesson !== null ? (
              <LessonViewer
                lesson={selectedLesson as any}
                courseId={course.id}
                isCompleted={completedLessonIds.has(selectedLesson.id)}
                onNext={goToNextLesson}
                onPrevious={goToPreviousLesson}
                hasNext={hasNextLesson}
                hasPrevious={hasPreviousLesson}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
                <h3 className="text-lg font-medium">Select a Lesson</h3>
                <p className="mt-1 text-sm text-muted-foreground">Choose a lesson from the sidebar to begin learning</p>
                {course.modules[0]?.lessons[0] && (
                  <Button className="mt-4" onClick={() => setSelectedLesson(course.modules[0].lessons[0])}>
                    <Play className="mr-2 h-4 w-4" />
                    Start First Lesson
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assessments" className="flex-1 m-0 p-6">
            {selectedAssessment ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedAssessment(null)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Assessments
                </Button>

                {/* Quiz Assessment */}
                {selectedAssessment.assessment_type === 'quiz' ? (
                  loadingQuiz ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : quizQuestions.length > 0 ? (
                    <QuizTaker
                      assessmentId={selectedAssessment.id}
                      assessmentTitle={selectedAssessment.title}
                      questions={quizQuestions}
                      totalPoints={selectedAssessment.total_points}
                      passingScore={selectedAssessment.passing_score}
                      dueDate={selectedAssessment.due_date || undefined}
                      timeLimitMinutes={selectedAssessment.time_limit_minutes}
                      shuffleQuestions={selectedAssessment.shuffle_questions}
                      showFeedback={selectedAssessment.show_feedback !== false}
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No questions available for this quiz</p>
                        <p className="text-sm text-muted-foreground mt-1">The instructor has not added questions yet.</p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  /* Assignment/Exam Assessment */
                  <AssignmentView
                    assessment={selectedAssessment}
                    submission={submissions.find((s) => s.assessment_id === selectedAssessment.id) || null}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Course Assessments</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete these assessments to demonstrate your understanding
                  </p>
                </div>

                {assessments.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {assessments.map((assessment) => {
                      const submission = submissions.find((s) => s.assessment_id === assessment.id)
                      return (
                        <AssessmentCard
                          key={assessment.id}
                          assessment={assessment}
                          submission={submission}
                          onClick={() => setSelectedAssessment(assessment)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No assessments available yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discussions" className="flex-1 m-0 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Course Discussions</h3>
                <p className="text-sm text-muted-foreground">Engage with your instructor and fellow students</p>
              </div>

              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Discussion forums coming soon</p>
                  <p className="mt-1 text-sm text-muted-foreground">Connect with classmates and ask questions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info" className="flex-1 m-0 p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{course.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Credits</p>
                      <p className="text-lg font-semibold">{course.credits}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold">{course.duration_weeks} Weeks</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Modules</p>
                      <p className="text-lg font-semibold">{course.modules.length}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Lessons</p>
                      <p className="text-lg font-semibold">{totalLessons}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.learning_objectives && course.learning_objectives.length > 0 ? (
                    <ul className="space-y-2">
                      {course.learning_objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Learning objectives will be provided by the instructor</p>
                  )}
                </CardContent>
              </Card>

              {course.instructor && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
                        {course.instructor.first_name?.[0]}
                        {course.instructor.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {course.instructor.first_name} {course.instructor.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">Course Instructor</p>
                        {course.instructor.bio && (
                          <p className="mt-2 text-sm text-muted-foreground">{course.instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
