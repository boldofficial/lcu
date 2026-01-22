export type NotificationType = "info" | "success" | "warning" | "error"
export type NotificationCategory = "enrollment" | "payment" | "grade" | "announcement" | "application" | "course" | "system"

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: NotificationType
    category: NotificationCategory
    link?: string | null
    is_read: boolean
    created_at: string
}

export interface CreateNotificationInput {
    userId: string
    title: string
    message: string
    type: NotificationType
    category: NotificationCategory
    link?: string
}

/**
 * Get category icon (emoji) for display
 */
export function getCategoryIcon(category: NotificationCategory): string {
    const icons: Record<NotificationCategory, string> = {
        enrollment: "🎓",
        payment: "💳",
        grade: "📊",
        announcement: "📢",
        application: "📝",
        course: "📚",
        system: "⚙️",
    }
    return icons[category] || "📌"
}

/**
 * Format time ago for display
 */
export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
}
