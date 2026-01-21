"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Shield, GraduationCap, BookOpen, ClipboardList } from "lucide-react"

const roles = [
  { id: "admin", label: "Admin Dashboard", icon: Shield, path: "/admin" },
  { id: "faculty", label: "Faculty Dashboard", icon: BookOpen, path: "/faculty" },
  { id: "registrar", label: "Registrar Dashboard", icon: ClipboardList, path: "/registrar" },
  { id: "student", label: "Student Dashboard", icon: GraduationCap, path: "/dashboard" },
]

export function DevRoleSwitcher() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">DEV MODE: View Dashboard As</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roles.map((role) => (
            <DropdownMenuItem
              key={role.id}
              onClick={() => {
                router.push(role.path)
                setIsOpen(false)
              }}
              className="cursor-pointer"
            >
              <role.icon className="mr-2 h-4 w-4" />
              {role.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
