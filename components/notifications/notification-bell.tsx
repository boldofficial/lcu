"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications"
import { Notification } from "@/lib/notification-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NotificationBellProps {
    userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchNotifications = async () => {
        const data = await getNotifications(userId, 5)
        const count = await getUnreadCount(userId)
        setNotifications(data)
        setUnreadCount(count)
        setLoading(false)
    }

    useEffect(() => {
        fetchNotifications()

        // In a real app, we would set up a Supabase Realtime subscription here
        // For this implementation, we'll just poll every 60 seconds as a fallback
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [userId])

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const success = await markAsRead(id)
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const handleMarkAllRead = async () => {
        const success = await markAllAsRead(userId)
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        }
    }

    const handleSelect = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        if (notification.link) {
            router.push(notification.link)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 shrink-0 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[380px]" align="end">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex h-20 items-center justify-center">
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col gap-1 p-2">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onSelect={() => handleSelect(notification)}
                                    onMarkRead={handleMarkAsRead}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-32 flex-col items-center justify-center text-center p-4">
                            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No new notifications</p>
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <Link href="/dashboard/notifications" className="block w-full">
                    <DropdownMenuItem className="w-full cursor-pointer justify-center text-xs text-muted-foreground hover:text-primary">
                        View all notifications
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
