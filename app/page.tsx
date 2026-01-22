import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  Globe,
  Users,
  Heart,
  Laptop,
  Hourglass,
  Lightbulb,
  Calendar
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(first_name, last_name)")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative flex min-h-[500px] items-center justify-center py-16 lg:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-students.png"
            alt="LCU Campus Life"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f2e] via-[#261642]/90 to-[#261642]/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 w-full">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-md">
              Empowering <span className="text-[#d4a843]">Kingdom Leaders</span> for Global Impact
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-200 md:text-xl leading-relaxed">
              Earn your fully accredited degree in Theology, Ministry, Counseling, or Business.
              100% online, flexible, and chemically designed for your calling.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/programs">
                <Button className="h-14 min-w-[180px] rounded-full bg-[#d4a843] px-8 text-lg font-semibold text-white transition-all hover:bg-[#c49935] hover:scale-105">
                  Explore Degrees
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/apply">
                <Button variant="outline" className="h-14 min-w-[180px] rounded-full border-2 border-white bg-transparent px-8 text-lg font-semibold text-white transition-all hover:bg-white hover:text-[#261642]">
                  Apply Now
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/20 pt-8">
              <div>
                <p className="text-3xl font-bold text-[#d4a843]">100%</p>
                <p className="text-sm text-gray-300">Online</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-[#d4a843]">Accredited</p>
                <p className="text-sm text-gray-300">Degree Programs</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-[#d4a843]">Global</p>
                <p className="text-sm text-gray-300">Community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kingdom Leader Section */}
      <section id="about" className="py-20 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div className="relative order-first lg:order-first">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl">
                <Image
                  src="/graduate-student.png"
                  alt="Kingdom Leader Graduate"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl tracking-tight">
                <span className="text-[#261642] block">Become A Kingdom Leader</span>
                <span className="text-[#d4a843] block mt-2">With Landmark Christian University</span>
              </h2>
              <div className="mt-8 space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  At Landmark Christian University (LCU), our mission is to equip leaders
                  who will advance God&apos;s kingdom, transforming lives, and their
                  communities and the world. Navigate through a Christ-centered, academically
                  rigorous, fully online world-class education, we prepare you to
                  influence and lead the world through Christ-like ideals in every
                  sphere of life.
                </p>
                <p>
                  Join our global community of believers and transform your calling into
                  impactful learning. We welcome you to this shared pursuit of Christ
                  learning.
                </p>
              </div>
              <div className="mt-10">
                <Link href="/apply">
                  <Button className="h-14 rounded-full bg-[#d4a843] px-10 text-lg font-semibold text-white transition-all hover:bg-[#c49935] hover:shadow-lg hover:-translate-y-0.5">
                    Get Started Today
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-[#261642] py-20 lg:py-32 text-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-[#d4a843] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-[#d4a843] opacity-10 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-5xl tracking-tight">Why Choose <span className="text-[#d4a843]">Landmark Christian University?</span></h2>
            <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[#d4a843]"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Heart className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Fully Accredited Online Christian University</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Gain confidence in quality, credibility, and recognition for advanced study and ministry roles with our fully accredited Christian degrees.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Laptop className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">100% Online & Flexible Learning</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Study anywhere, on your schedule — ideal for busy professionals, ministry leaders, and international students.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Hourglass className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Learn at Your Own Pace</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Program lengths range from 6 to 36 months, allowing you to graduate without pausing your life or ministry commitments.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Globe className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Global & Accessible Christian Education</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Designed for international students and lifelong learners seeking to make a Kingdom impact worldwide.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Users className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Supportive Christian Community</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Join a Christ-centered community with caring faculty, mentors, and peers dedicated to your success.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl">
              <CardContent className="flex flex-col items-center p-6 text-center relative z-10">
                <div className="mb-4">
                  <Lightbulb className="h-10 w-10 text-[#d4a843]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Clear Ministry & Career Pathways</h4>
                <p className="text-sm text-gray-200 leading-relaxed max-w-sm">
                  Practical preparation for leadership in church, counseling, workplace ministry, and Christian entrepreneurship.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Degree Programs Section */}
      <section id="programs" className="bg-gray-50 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#261642] md:text-5xl">Our Degree Programs</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
              Pursue a spiritual and career goal, growth with credentials from our online distance and open
              programs, designed to fulfill your calling. Designed to prepare you for purposeful life for
              ministry, business, and more.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {/* Bachelor */}
            <Card className="flex flex-col overflow-hidden border-0 bg-white shadow-2xl rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/university-campus-with-cross-and-students.jpg"
                  alt="Bachelor Programs"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="mb-3 text-xl font-bold text-[#261642] md:text-2xl">Bachelor Degree Programs</h3>
                <p className="mb-8 text-gray-600 leading-relaxed flex-1">
                  Explore our Bachelor programs in Christian Leadership, Ministry and more in coaching for Theology, Divinity, Religious arts, and more.
                </p>
                <Link href="/programs" className="mt-auto">
                  <Button className="w-full rounded-full bg-[#d4a843] h-12 text-base font-semibold text-white transition-all hover:bg-[#c49935] hover:shadow-lg">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Master */}
            <Card className="flex flex-col overflow-hidden border-0 bg-white shadow-2xl rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/graduate-student.png"
                  alt="Master Programs"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="mb-3 text-xl font-bold text-[#261642] md:text-2xl">Master&apos;s Degree Programs</h3>
                <p className="mb-8 text-gray-600 leading-relaxed flex-1">
                  Take your faith to the next level with in-depth ministry and theological masterclass with our M.Div leadership programs.
                </p>
                <Link href="/programs" className="mt-auto">
                  <Button className="w-full rounded-full bg-[#d4a843] h-12 text-base font-semibold text-white transition-all hover:bg-[#c49935] hover:shadow-lg">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Doctoral */}
            <Card className="flex flex-col overflow-hidden border-0 bg-white shadow-2xl rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/video-thumbnail-bible-study.jpg"
                  alt="Doctoral Programs"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="flex flex-1 flex-col p-8">
                <h3 className="mb-3 text-xl font-bold text-[#261642] md:text-2xl">Doctoral Degree Programs</h3>
                <p className="mb-8 text-gray-600 leading-relaxed flex-1">
                  Perfect for ministry leaders, our Christian Leadership Doctorate programs in Christian Counseling with emphasis in Society, Theology and more.
                </p>
                <Link href="/programs" className="mt-auto">
                  <Button className="w-full rounded-full bg-[#d4a843] h-12 text-base font-semibold text-white transition-all hover:bg-[#c49935] hover:shadow-lg">
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#4a3472] md:text-5xl">Latest News & Insights</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Discover the latest stories from our vibrant community.
              </p>
            </div>
            <Link href="/blog" className="hidden md:block">
              <Button variant="outline" className="border-[#261642] text-[#261642]">View All News</Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full border-gray-100">
                  <div className="relative h-48 w-full bg-gray-100">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">No Image</div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at!).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-bold text-[#261642] line-clamp-2 leading-tight">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-grow pb-4">
                    <p className="text-gray-600 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No news updates available at the moment.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/blog">
              <Button variant="outline" className="border-[#261642] text-[#261642]">View All News</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ready To Start Section */}
      <section className="relative bg-[#faf6ee] py-20 lg:py-32">
        {/* Decorative line art background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="#261642" strokeWidth="0.5" fill="none" />
            <path d="M0,60 Q25,40 50,60 T100,60" stroke="#261642" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 md:px-12 text-center">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-[#261642] md:text-5xl tracking-tight">
              Ready To Start Your Online Christian Degree Journey?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Apply to Landmark Christian University today and take your faith and ministry calling to the next level. We offer
              diverse accredited programs in Theology, Ministry, Counseling, and Business designed to run on your own terms,
              family, and ministry.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/apply">
                <Button className="h-14 min-w-[200px] rounded-full bg-[#d4a843] px-8 text-lg font-semibold text-white hover:bg-[#c49935] hover:shadow-lg">
                  Start Application
                </Button>
              </Link>
              <Link href="/programs">
                <Button variant="outline" className="h-14 min-w-[200px] rounded-full border-[#261642] text-lg font-semibold text-[#261642] hover:bg-[#261642] hover:text-white">
                  View All Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#261642] py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="text-white text-center lg:text-left">
              <h4 className="text-2xl font-bold">Subscribe to Our Newsletter</h4>
              <p className="mt-2 text-white/80">
                Stay updated with the latest campus news, academic insights, and stories of global impact from Landmark Christian University.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <Input
                type="email"
                placeholder="Email Address"
                className="h-12 rounded-full bg-white/10 text-white placeholder:text-white/50 border-white/20 px-6 backdrop-blur-sm focus-visible:ring-[#d4a843]"
              />
              <Button className="h-12 rounded-full bg-[#d4a843] px-8 font-semibold text-white hover:bg-[#c49935]">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
