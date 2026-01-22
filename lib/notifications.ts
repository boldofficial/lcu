"use server"

import { createClient } from "@/lib/supabase/server"
import { Notification, CreateNotificationInput } from "./notification-utils"

export type { Notification, NotificationCategory, NotificationType, CreateNotificationInput } from "./notification-utils"

/**
 * Create a new notification for a user
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("notifications")
        .insert({
            user_id: input.userId,
            title: input.title,
            message: input.message,
            type: input.type,
            category: input.category,
            link: input.link,
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating notification:", error)
        return null
    }

    return data
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) {
        console.error("Error fetching notifications:", error)
        return []
    }

    return data || []
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false)

    if (error) {
        console.error("Error fetching unread count:", error)
        return 0
    }

    return count || 0
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)

    if (error) {
        console.error("Error marking notification as read:", error)
        return false
    }

    return true
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

    if (error) {
        console.error("Error marking all as read:", error)
        return false
    }

    return true
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)

    if (error) {
        console.error("Error deleting notification:", error)
        return false
    }

    return true
}
