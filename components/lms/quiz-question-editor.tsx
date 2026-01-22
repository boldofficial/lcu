"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Check } from "lucide-react"
import type { QuizQuestion, QuestionType } from "@/lib/types"

interface QuizQuestionEditorProps {
    assessmentId: string
    existingQuestion?: QuizQuestion
    onSave: (question: Omit<QuizQuestion, "id" | "created_at" | "updated_at">) => Promise<void>
    onCancel: () => void
}

export function QuizQuestionEditor({ assessmentId, existingQuestion, onSave, onCancel }: QuizQuestionEditorProps) {
    const [questionText, setQuestionText] = useState(existingQuestion?.question_text || "")
    const [questionType, setQuestionType] = useState<QuestionType>(existingQuestion?.question_type || "multiple_choice")
    const [options, setOptions] = useState<string[]>(
        existingQuestion?.options || ["", "", "", ""]
    )
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(existingQuestion?.correct_answer_index || 0)
    const [points, setPoints] = useState(existingQuestion?.points || 1)
    const [saving, setSaving] = useState(false)

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, ""])
        }
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index)
            setOptions(newOptions)
            if (correctAnswerIndex >= newOptions.length) {
                setCorrectAnswerIndex(0)
            }
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleSubmit = async () => {
        if (!questionText.trim()) return

        // For true/false, use hardcoded options; for multiple_choice, validate user options
        const finalOptions = questionType === "true_false" ? ["True", "False"] : options.filter(opt => opt.trim())

        if (questionType === "multiple_choice" && finalOptions.length < 2) {
            return // Need at least 2 options for multiple choice
        }

        setSaving(true)
        try {
            await onSave({
                assessment_id: assessmentId,
                question_text: questionText,
                question_type: questionType,
                options: finalOptions,
                correct_answer_index: correctAnswerIndex,
                points,
                order_index: existingQuestion?.order_index || 0
            })
        } finally {
            setSaving(false)
        }
    }

    // For true/false, override options
    const effectiveOptions = questionType === "true_false" ? ["True", "False"] : options

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    {existingQuestion ? "Edit Question" : "Add Question"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True / False</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                        placeholder="Enter your question..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Points</Label>
                    <Input
                        type="number"
                        min={1}
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                        className="w-24"
                    />
                </div>

                <div className="space-y-3">
                    <Label>Answer Options (select the correct answer)</Label>
                    <RadioGroup value={String(correctAnswerIndex)} onValueChange={(v) => setCorrectAnswerIndex(parseInt(v))}>
                        {effectiveOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                {questionType === "true_false" ? (
                                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                        {option}
                                    </Label>
                                ) : (
                                    <Input
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        className="flex-1"
                                    />
                                )}
                                {questionType === "multiple_choice" && options.length > 2 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                                {correctAnswerIndex === index && (
                                    <Check className="h-4 w-4 text-green-600" />
                                )}
                            </div>
                        ))}
                    </RadioGroup>

                    {questionType === "multiple_choice" && options.length < 6 && (
                        <Button variant="outline" size="sm" onClick={addOption}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                        </Button>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? "Saving..." : existingQuestion ? "Update" : "Add Question"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
