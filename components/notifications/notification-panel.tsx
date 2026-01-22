"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Filter, CheckCircle2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationItem } from "./notification-item"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/lib/notifications"
import { Notification, NotificationCategory } from "@/lib/notification-utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface NotificationPanelProps {
    userId: string
}

export function NotificationPanel({ userId }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const [search, setSearch] = useState("")

    const fetchNotifications = async () => {
        setLoading(true)
        const data = await getNotifications(userId, 50)
        setNotifications(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchNotifications()
    }, [userId])

    const handleMarkRead = async (id: string) => {
        const success = await markAsRead(id)
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    const handleMarkAllRead = async () => {
        const success = await markAllAsRead(userId)
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        }
    }

    const handleDelete = async (id: string) => {
        const success = await deleteNotification(id)
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === "all" || n.category === filter || (filter === "unread" && !n.is_read)
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const categories: { label: string, value: string }[] = [
        { label: "All", value: "all" },
        { label: "Unread", value: "unread" },
        { label: "Enrollments", value: "enrollment" },
        { label: "Payments", value: "payment" },
        { label: "Grades", value: "grade" },
        { label: "System", value: "system" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">Manage your alerts and system messages</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark all read
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchNotifications}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2 max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search notifications..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8"
                            />
                        </div>
                    </div>
                    <div className="mt-4 overflow-x-auto pb-1">
                        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                            <TabsList className="bg-muted/50 p-1">
                                {categories.map((cat) => (
                                    <TabsTrigger key={cat.value} value={cat.value} className="text-xs px-4">
                                        {cat.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        {loading ? (
                            <div className="space-y-4 py-8 text-center text-muted-foreground">
                                <p>Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            <div className="space-y-4">
                                {filteredNotifications.map((notification) => (
                                    <div key={notification.id} className="relative group border rounded-xl overflow-hidden shadow-sm">
                                        <NotificationItem
                                            notification={notification}
                                            onSelect={handleMarkRead}
                                        />
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="absolute right-4 bottom-4 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Bell className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-lg font-semibold">No notifications found</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                    {search ? `No results for "${search}" in this category.` : "You're all caught up! There are no messages to show here yet."}
                                </p>
                                {search && (
                                    <Button variant="link" onClick={() => setSearch("")} className="mt-2 h-auto p-0">Clear search</Button>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
