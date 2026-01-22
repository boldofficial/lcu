"use client"

import { Notification } from "@/lib/notification-utils"
import { getCategoryIcon, formatTimeAgo } from "@/lib/notification-utils"
import { cn } from "@/lib/utils"
import { Bell, CreditCard, GraduationCap, MessageSquare, BookOpen, AlertCircle, Info, CheckCircle2 } from "lucide-react"

interface NotificationItemProps {
    notification: Notification
    onSelect?: (id: string) => void
    onMarkRead?: (id: string, e: React.MouseEvent) => void
}

export function NotificationItem({ notification, onSelect, onMarkRead }: NotificationItemProps) {
    const isRead = notification.is_read

    const TypeIcon = {
        info: Info,
        success: CheckCircle2,
        warning: AlertCircle,
        error: AlertCircle,
    }[notification.type]

    const typeColorClasses = {
        info: "text-info bg-info/10",
        success: "text-success bg-success/10",
        warning: "text-warning bg-warning/10",
        error: "text-destructive bg-destructive/10",
    }[notification.type]

    return (
        <div
            onClick={() => onSelect?.(notification.id)}
            className={cn(
                "group relative flex cursor-pointer gap-4 rounded-lg p-4 transition-all hover:bg-muted/50",
                !isRead && "bg-primary/5 shadow-sm"
            )}
        >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg", typeColorClasses)}>
                <span className="relative">
                    {getCategoryIcon(notification.category)}
                    {!isRead && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </span>
                    )}
                </span>
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-semibold leading-none", !isRead ? "text-foreground" : "text-muted-foreground")}>
                        {notification.title}
                    </p>
                    <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                    </span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {notification.message}
                </p>
            </div>

            {!isRead && (
                <button
                    onClick={(e) => onMarkRead?.(notification.id, e)}
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                    title="Mark as read"
                />
            )}
        </div>
    )
}
