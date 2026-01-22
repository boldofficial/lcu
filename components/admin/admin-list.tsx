"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, User } from "lucide-react"

interface Admin {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    is_active: boolean
    created_at: string
}

interface AdminListProps {
    currentUserId: string
}

export function AdminList({ currentUserId }: AdminListProps) {
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAdmins() {
            try {
                const response = await fetch("/api/admin/admins")
                if (!response.ok) {
                    throw new Error("Failed to fetch admins")
                }
                const data = await response.json()
                setAdmins(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load admins")
            } finally {
                setLoading(false)
            }
        }
        fetchAdmins()
    }, [])

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                {error}
            </div>
        )
    }

    if (admins.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No administrators found</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {admins.map((admin) => (
                        <TableRow key={admin.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        {admin.first_name?.[0] || <User className="h-4 w-4" />}
                                        {admin.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {admin.first_name} {admin.last_name}
                                            {admin.id === currentUserId && (
                                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                            <TableCell className="text-muted-foreground">{admin.phone || "—"}</TableCell>
                            <TableCell>
                                <Badge variant={admin.is_active ? "default" : "secondary"}>
                                    {admin.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(admin.created_at).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
