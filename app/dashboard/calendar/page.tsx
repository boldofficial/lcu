import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, FileText, GraduationCap } from "lucide-react"

export const metadata = {
  title: "Academic Calendar",
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Academic Calendar</h1>
        <p className="mt-2 text-muted-foreground">Track your deadlines, assignments, and important dates</p>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Assignments and exams due in the next 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      item.type === "assignment"
                        ? "bg-blue-100 text-blue-600"
                        : item.type === "exam"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.type === "assignment" ? (
                      <FileText className="h-5 w-5" />
                    ) : item.type === "exam" ? (
                      <GraduationCap className="h-5 w-5" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={item.daysLeft <= 3 ? "destructive" : item.daysLeft <= 7 ? "default" : "secondary"}>
                    {item.daysLeft === 0 ? "Due Today" : item.daysLeft === 1 ? "Due Tomorrow" : `${item.daysLeft} days`}
                  </Badge>
                  <p className="mt-1 text-sm text-muted-foreground">{item.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Spring 2026 Academic Calendar
          </CardTitle>
          <CardDescription>Important dates for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {academicDates.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 rounded-lg border p-4 ${item.isPast ? "opacity-50" : ""}`}
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium">{item.month}</span>
                  <span className="text-lg font-bold">{item.day}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.event}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.isPast && <Badge variant="outline">Passed</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const upcomingDeadlines = [
  {
    id: "1",
    title: "Hermeneutics Essay",
    course: "BI-201: Biblical Interpretation",
    type: "assignment",
    dueDate: "Jan 17, 2026",
    daysLeft: 2,
  },
  {
    id: "2",
    title: "Midterm Exam",
    course: "TH-301: Systematic Theology I",
    type: "exam",
    dueDate: "Jan 20, 2026",
    daysLeft: 5,
  },
  {
    id: "3",
    title: "Discussion Post Week 3",
    course: "BI-101: Old Testament Survey",
    type: "discussion",
    dueDate: "Jan 22, 2026",
    daysLeft: 7,
  },
  {
    id: "4",
    title: "Research Paper Draft",
    course: "CH-201: Church History",
    type: "assignment",
    dueDate: "Jan 28, 2026",
    daysLeft: 13,
  },
]

const academicDates = [
  {
    month: "JAN",
    day: "6",
    event: "Spring Semester Begins",
    description: "First day of classes for Spring 2026",
    isPast: true,
  },
  {
    month: "JAN",
    day: "13",
    event: "Last Day to Add/Drop",
    description: "Deadline to add or drop courses without penalty",
    isPast: true,
  },
  {
    month: "FEB",
    day: "17",
    event: "Presidents Day",
    description: "University offices closed - classes continue online",
    isPast: false,
  },
  {
    month: "MAR",
    day: "9",
    event: "Spring Break Begins",
    description: "No classes March 9-15",
    isPast: false,
  },
  {
    month: "MAR",
    day: "16",
    event: "Classes Resume",
    description: "Spring break ends - classes resume",
    isPast: false,
  },
  {
    month: "APR",
    day: "10",
    event: "Good Friday",
    description: "University closed for Good Friday",
    isPast: false,
  },
  {
    month: "APR",
    day: "24",
    event: "Last Day to Withdraw",
    description: "Final deadline to withdraw from courses",
    isPast: false,
  },
  {
    month: "MAY",
    day: "4",
    event: "Final Exams Begin",
    description: "Final examination period May 4-8",
    isPast: false,
  },
  {
    month: "MAY",
    day: "15",
    event: "Commencement",
    description: "Spring 2026 Graduation Ceremony",
    isPast: false,
  },
]
