"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Quote, Code } from "lucide-react"

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 10 }: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState("write")

    const insertFormatting = (prefix: string, suffix: string = "") => {
        const textarea = document.getElementById("markdown-textarea") as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const before = value.substring(0, start)
        const after = value.substring(end)

        const newValue = `${before}${prefix}${selectedText}${suffix}${after}`
        onChange(newValue)

        // Defer focus restore slightly to allow react render
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + prefix.length, end + prefix.length)
        }, 0)
    }

    return (
        <div className="space-y-2 rounded-lg border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between border-b bg-muted/40 px-2 py-1">
                    <TabsList className="h-8">
                        <TabsTrigger value="write" className="text-xs">
                            Write
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs">
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === "write" && (
                        <div className="flex items-center gap-1">
                            <ToolbarButton icon={<Bold className="h-3 w-3" />} onClick={() => insertFormatting("**", "**")} tooltip="Bold" />
                            <ToolbarButton icon={<Italic className="h-3 w-3" />} onClick={() => insertFormatting("*", "*")} tooltip="Italic" />
                            <div className="mx-1 h-4 w-px bg-border" />
                            <ToolbarButton icon={<Heading1 className="h-3 w-3" />} onClick={() => insertFormatting("# ")} tooltip="Heading 1" />
                            <ToolbarButton icon={<Heading2 className="h-3 w-3" />} onClick={() => insertFormatting("## ")} tooltip="Heading 2" />
                            <div className="mx-1 h-4 w-px bg-border" />
                            <ToolbarButton icon={<List className="h-3 w-3" />} onClick={() => insertFormatting("- ")} tooltip="List" />
                            <ToolbarButton icon={<Quote className="h-3 w-3" />} onClick={() => insertFormatting("> ")} tooltip="Quote" />
                            <ToolbarButton icon={<Code className="h-3 w-3" />} onClick={() => insertFormatting("```\n", "\n```")} tooltip="Code Block" />
                            <div className="mx-1 h-4 w-px bg-border" />
                            <ToolbarButton icon={<LinkIcon className="h-3 w-3" />} onClick={() => insertFormatting("[", "](url)")} tooltip="Link" />
                        </div>
                    )}
                </div>

                <TabsContent value="write" className="mt-0 p-0">
                    <Textarea
                        id="markdown-textarea"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none p-4 resize-y font-mono text-sm leading-relaxed"
                        rows={rows}
                    />
                </TabsContent>

                <TabsContent value="preview" className="mt-0 min-h-[300px] overflow-y-auto p-6 bg-white dark:bg-black/20">
                    {/* Simple Markdown Renderer for Preview */}
                    {value ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                            {value.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold">{line.replace('# ', '')}</h1>
                                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4">{line.replace('## ', '')}</h2>
                                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-3">{line.replace('### ', '')}</h3>
                                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>
                                if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">{line.replace('> ', '')}</blockquote>
                                // Rough check for code blocks (very basic)
                                if (line.startsWith('```')) return null // Skip fences in simple render
                                return <p key={i} className={line.trim() === '' ? 'h-4' : ''}>{line}</p>
                            })}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">
                            Nothing to preview
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ToolbarButton({ icon, onClick, tooltip }: { icon: React.ReactNode; onClick: () => void; tooltip: string }) {
    return (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} type="button" title={tooltip}>
            {icon}
        </Button>
    )
}
