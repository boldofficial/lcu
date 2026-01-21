import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Enrollment {
  id: string
  status: string
  created_at: string
  student: {
    first_name: string
    last_name: string
    email: string
  }
  program: {
    name: string
    degree_type: string
  }
}

export function RecentEnrollmentsTable({ enrollments }: { enrollments: Enrollment[] }) {
  if (enrollments.length === 0) {
    return <div className="flex h-32 items-center justify-center text-muted-foreground">No recent enrollments</div>
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => (
        <div key={enrollment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {enrollment.student?.first_name?.[0]}
              {enrollment.student?.last_name?.[0]}
            </div>
            <div>
              <p className="font-medium">
                {enrollment.student?.first_name} {enrollment.student?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{enrollment.program?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>{enrollment.status}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(enrollment.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
