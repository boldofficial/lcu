import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, BookOpen, Heart, Clock, Calendar, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "Chapel & Devotionals",
}

export default async function ChapelPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Chapel & Devotionals</h1>
        <p className="mt-2 text-muted-foreground">
          Grow in your faith with daily devotionals and weekly chapel services
        </p>
      </div>

      {/* Daily Devotional */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Today&apos;s Devotional
            </Badge>
            <span className="text-sm text-muted-foreground">January 15, 2026</span>
          </div>
          <CardTitle className="mt-4 font-serif text-2xl">Walking in Faith</CardTitle>
          <CardDescription>A reflection on Hebrews 11:1</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <blockquote className="border-l-4 border-primary/50 pl-4 font-serif italic text-muted-foreground">
            &ldquo;Now faith is the substance of things hoped for, the evidence of things not seen.&rdquo;
            <footer className="mt-2 text-sm not-italic">— Hebrews 11:1 (KJV)</footer>
          </blockquote>
          <p className="text-foreground">
            Faith is not merely believing in what we cannot see, but trusting in the character of God who has proven
            Himself faithful throughout history. As students pursuing Christian education, we are called to integrate
            this faith into every area of our learning...
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Read Full Devotional
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Save to Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chapel Services */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Weekly Chapel Services</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {chapelServices.map((service) => (
            <Card key={service.id} className={service.isLive ? "border-accent" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={service.isLive ? "default" : service.watched ? "secondary" : "outline"}>
                    {service.isLive ? "Live Now" : service.watched ? "Watched" : "Available"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </div>
                </div>
                <CardTitle className="mt-2 text-lg">{service.title}</CardTitle>
                <CardDescription>{service.speaker}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {service.date}
                  </div>
                  <Button size="sm" variant={service.isLive ? "default" : "outline"}>
                    <Play className="mr-2 h-4 w-4" />
                    {service.isLive ? "Join Live" : "Watch"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Devotional Archive */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Devotional Archive</h2>
        <div className="grid gap-3">
          {devotionalArchive.map((devotional) => (
            <Card key={devotional.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {devotional.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{devotional.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {devotional.scripture} • {devotional.date}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Read
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Prayer Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Community Prayer</CardTitle>
          <CardDescription>Share prayer requests with the LCU community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We believe in the power of prayer and the strength of community. Share your prayer requests with fellow
            students and faculty, or offer to pray for others in our community.
          </p>
          <div className="flex gap-3">
            <Button>Submit Prayer Request</Button>
            <Button variant="outline">View Prayer Wall</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const chapelServices = [
  {
    id: "1",
    title: "The Heart of a Servant Leader",
    speaker: "Dr. Michael Thompson, University President",
    date: "January 15, 2026",
    duration: "45 min",
    isLive: true,
    watched: false,
  },
  {
    id: "2",
    title: "Finding Purpose in Your Calling",
    speaker: "Rev. Sarah Mitchell, Campus Pastor",
    date: "January 8, 2026",
    duration: "42 min",
    isLive: false,
    watched: true,
  },
  {
    id: "3",
    title: "Navigating Challenges with Faith",
    speaker: "Dr. James Wilson, Dean of Students",
    date: "January 1, 2026",
    duration: "38 min",
    isLive: false,
    watched: true,
  },
  {
    id: "4",
    title: "New Year, New Beginnings",
    speaker: "Guest Speaker: Pastor David Chen",
    date: "December 25, 2025",
    duration: "50 min",
    isLive: false,
    watched: false,
  },
]

const devotionalArchive = [
  {
    id: "1",
    title: "Walking in Faith",
    scripture: "Hebrews 11:1",
    date: "Jan 15",
    completed: false,
  },
  {
    id: "2",
    title: "The Armor of God",
    scripture: "Ephesians 6:10-18",
    date: "Jan 14",
    completed: true,
  },
  {
    id: "3",
    title: "Love One Another",
    scripture: "John 13:34-35",
    date: "Jan 13",
    completed: true,
  },
  {
    id: "4",
    title: "Seek First the Kingdom",
    scripture: "Matthew 6:33",
    date: "Jan 12",
    completed: true,
  },
  {
    id: "5",
    title: "Be Still and Know",
    scripture: "Psalm 46:10",
    date: "Jan 11",
    completed: false,
  },
]
