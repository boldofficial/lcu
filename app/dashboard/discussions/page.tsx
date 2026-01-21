import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Clock, Search, Plus, Pin } from "lucide-react"

export const metadata = {
  title: "Discussions",
}

export default function DiscussionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discussion Forums</h1>
          <p className="mt-2 text-muted-foreground">Engage with classmates and instructors in course discussions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search discussions..." className="pl-10" />
      </div>

      {/* Course Forums */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Courses</CardTitle>
              <CardDescription>Select a course to view discussions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                    course.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div>
                    <p className="font-medium">{course.code}</p>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  {course.unread > 0 && (
                    <Badge variant="default" className="ml-2">
                      {course.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Discussion Threads */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>BI-201: Biblical Interpretation</CardTitle>
                  <CardDescription>15 active discussions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {discussion.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {discussion.pinned && <Pin className="h-4 w-4 text-primary" />}
                        <h3 className="font-medium text-foreground">{discussion.title}</h3>
                        {discussion.isNew && <Badge variant="secondary">New</Badge>}
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{discussion.preview}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {discussion.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {discussion.lastActivity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const courses = [
  { id: "1", code: "BI-201", name: "Biblical Interpretation", unread: 3, active: true },
  { id: "2", code: "TH-301", name: "Systematic Theology I", unread: 1, active: false },
  { id: "3", code: "BI-101", name: "Old Testament Survey", unread: 0, active: false },
  { id: "4", code: "CH-201", name: "Church History", unread: 5, active: false },
]

const discussions = [
  {
    id: "1",
    title: "Week 3: Hermeneutical Methods Discussion",
    preview:
      "Please share your thoughts on the different hermeneutical approaches discussed in this week's reading. How do you see these methods being applied in your own Bible study?",
    author: "Dr. Sarah Mitchell",
    authorInitials: "SM",
    replies: 24,
    participants: 18,
    lastActivity: "2 hours ago",
    pinned: true,
    isNew: false,
  },
  {
    id: "2",
    title: "Question about literal vs. allegorical interpretation",
    preview:
      "I'm struggling to understand when it's appropriate to interpret passages literally versus allegorically. Can someone help explain the criteria we should use?",
    author: "Michael Thompson",
    authorInitials: "MT",
    replies: 8,
    participants: 6,
    lastActivity: "4 hours ago",
    pinned: false,
    isNew: true,
  },
  {
    id: "3",
    title: "Resources for studying Hebrew poetry",
    preview:
      "Does anyone have recommendations for additional resources on understanding Hebrew poetry structure? The textbook mentions parallelism but I'd like to go deeper.",
    author: "Rebecca Chen",
    authorInitials: "RC",
    replies: 12,
    participants: 9,
    lastActivity: "1 day ago",
    pinned: false,
    isNew: false,
  },
  {
    id: "4",
    title: "Application: Interpreting Psalms in pastoral care",
    preview:
      "I'd love to hear how others are applying our hermeneutical principles when using Psalms in counseling or pastoral care situations.",
    author: "David Wilson",
    authorInitials: "DW",
    replies: 15,
    participants: 11,
    lastActivity: "2 days ago",
    pinned: false,
    isNew: false,
  },
]
