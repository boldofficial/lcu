"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, Trophy, XCircle } from "lucide-react"
import { submitQuizAttempt } from "@/app/actions/quiz"
import type { QuizQuestion } from "@/lib/types"

interface QuizTakerProps {
    assessmentId: string
    assessmentTitle: string
    questions: QuizQuestion[]
    totalPoints: number
    passingScore: number
    dueDate?: string
    timeLimitMinutes?: number | null
    shuffleQuestions?: boolean
    showFeedback?: boolean
}

type QuizState = "taking" | "submitting" | "completed"

interface QuizResult {
    grade: number
    earnedPoints: number
    totalPoints: number
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export function QuizTaker({
    assessmentId,
    assessmentTitle,
    questions,
    totalPoints,
    passingScore,
    dueDate,
    timeLimitMinutes,
    shuffleQuestions = false,
    showFeedback = true
}: QuizTakerProps) {
    // Shuffle questions on mount if enabled
    const displayQuestions = useMemo(() => {
        return shuffleQuestions ? shuffleArray(questions) : questions
    }, [questions, shuffleQuestions])

    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [quizState, setQuizState] = useState<QuizState>("taking")
    const [result, setResult] = useState<QuizResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState<number | null>(
        timeLimitMinutes ? timeLimitMinutes * 60 : null
    )
    const [timerExpired, setTimerExpired] = useState(false)

    // Timer effect
    useEffect(() => {
        if (!timeRemaining || quizState !== "taking") return

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval)
                    setTimerExpired(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timeRemaining, quizState])

    // Auto-submit when timer expires
    useEffect(() => {
        if (timerExpired && quizState === "taking") {
            handleSubmit(true)
        }
    }, [timerExpired])

    const currentQuestion = displayQuestions[currentQuestionIndex]
    const answeredCount = Object.keys(answers).length
    const progress = (answeredCount / displayQuestions.length) * 100

    // Format time remaining
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleAnswer = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
    }

    const handleSubmit = (autoSubmit = false) => {
        if (!autoSubmit && answeredCount < displayQuestions.length) {
            setError("Please answer all questions before submitting.")
            return
        }

        setQuizState("submitting")
        setError(null)

        startTransition(async () => {
            const answerArray = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
                question_id: questionId,
                selected_option_index: selectedOptionIndex
            }))

            const response = await submitQuizAttempt({
                assessment_id: assessmentId,
                answers: answerArray
            })

            if (response.error) {
                setError(response.error)
                setQuizState("taking")
            } else if (response.success) {
                setResult({
                    grade: response.grade ?? 0,
                    earnedPoints: response.earnedPoints ?? 0,
                    totalPoints: response.totalPoints ?? 0
                })
                setQuizState("completed")
            }
        })
    }

    // Completed state with optional feedback
    if (quizState === "completed" && result) {
        const passed = result.grade >= passingScore
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${passed ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
                            {passed ? (
                                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <CardTitle>{passed ? "Congratulations!" : "Quiz Completed"}</CardTitle>
                        <CardDescription>
                            {passed ? "You passed the quiz!" : `You need ${passingScore}% to pass.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="text-5xl font-bold">{result.grade}%</div>
                        <p className="text-muted-foreground">
                            {result.earnedPoints} out of {result.totalPoints} points
                        </p>
                        <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-1">
                            {passed ? "PASSED" : "NOT PASSED"}
                        </Badge>
                        {timerExpired && (
                            <p className="text-sm text-muted-foreground">
                                Time expired - quiz was auto-submitted
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback - Show correct answers */}
                {showFeedback && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Your Answers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {displayQuestions.map((question, index) => {
                                const userAnswer = answers[question.id]
                                const isCorrect = userAnswer === question.correct_answer_index
                                return (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-full p-1 ${isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Q{index + 1}: {question.question_text}</p>
                                                <div className="mt-2 space-y-1 text-sm">
                                                    {question.options.map((option, optIndex) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`px-3 py-1.5 rounded ${optIndex === question.correct_answer_index
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : userAnswer === optIndex && !isCorrect
                                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 line-through"
                                                                        : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {String.fromCharCode(65 + optIndex)}. {option}
                                                            {optIndex === question.correct_answer_index && " ✓"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header with Timer */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{assessmentTitle}</CardTitle>
                            <CardDescription>
                                Question {currentQuestionIndex + 1} of {displayQuestions.length}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {timeRemaining !== null && (
                                <Badge
                                    variant={timeRemaining < 60 ? "destructive" : "outline"}
                                    className={`flex items-center gap-1 text-lg ${timeRemaining < 60 ? "animate-pulse" : ""}`}
                                >
                                    <Clock className="h-4 w-4" />
                                    {formatTime(timeRemaining)}
                                </Badge>
                            )}
                            {dueDate && !timeRemaining && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Due: {new Date(dueDate).toLocaleDateString()}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Progress value={progress} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                        {answeredCount} of {displayQuestions.length} answered
                    </p>
                </CardHeader>
            </Card>

            {/* Question */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary">{currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}</Badge>
                        <Badge variant="outline">{currentQuestion.question_type === "true_false" ? "True/False" : "Multiple Choice"}</Badge>
                    </div>
                    <CardTitle className="text-xl mt-4">{currentQuestion.question_text}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion.id]?.toString() ?? ""}
                        onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
                    >
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value={String(index)} id={`q${currentQuestion.id}-opt${index}`} />
                                <Label htmlFor={`q${currentQuestion.id}-opt${index}`} className="flex-1 cursor-pointer">
                                    {option}
                                </Label>
                                {answers[currentQuestion.id] === index && (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>
                    {currentQuestionIndex < displayQuestions.length - 1 ? (
                        <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={() => handleSubmit()} disabled={isPending || quizState === "submitting"}>
                            {isPending ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4 text-destructive flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </CardContent>
                </Card>
            )}

            {/* Question Navigator */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {displayQuestions.map((q, index) => (
                            <Button
                                key={q.id}
                                variant={currentQuestionIndex === index ? "default" : answers[q.id] !== undefined ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setCurrentQuestionIndex(index)}
                                className="w-10 h-10"
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
