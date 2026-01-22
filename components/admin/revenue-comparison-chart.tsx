"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { TrendingUp, DollarSign } from "lucide-react"

interface RevenueComparisonChartProps {
    data?: { month: string; current: number; previous: number }[]
}

const defaultData = [
    { month: "Jan", current: 45000, previous: 38000 },
    { month: "Feb", current: 52000, previous: 42000 },
    { month: "Mar", current: 48000, previous: 45000 },
    { month: "Apr", current: 61000, previous: 51000 },
    { month: "May", current: 55000, previous: 49000 },
    { month: "Jun", current: 67000, previous: 53000 },
]

export function RevenueComparisonChart({ data }: RevenueComparisonChartProps) {
    const chartData = data || defaultData

    return (
        <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-muted/20">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        Revenue Growth
                    </CardTitle>
                    <CardDescription>Year-over-year tuition revenue comparison</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full text-xs font-bold">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs Last Year
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            barGap={8}
                        >
                            <defs>
                                <linearGradient id="currentRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="previousRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-card p-3 shadow-xl ring-1 ring-black/5">
                                                <p className="font-bold text-sm mb-2">{label}</p>
                                                <div className="space-y-1.5">
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill === "url(#currentRevenue)" ? "var(--primary)" : "var(--cyan)" }} />
                                                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                                                            </div>
                                                            <span className="text-xs font-bold font-mono">${entry.value.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: "0px", paddingBottom: "30px", fontSize: "12px", fontWeight: "600" }}
                            />
                            <Bar
                                name="Current Year"
                                dataKey="current"
                                fill="url(#currentRevenue)"
                                radius={[6, 6, 0, 0]}
                                animationDuration={1500}
                            />
                            <Bar
                                name="Previous Year"
                                dataKey="previous"
                                fill="url(#previousRevenue)"
                                radius={[6, 6, 0, 0]}
                                animationDuration={2000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
