"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart
} from "recharts"

interface EnrollmentTrendsChartProps {
    data?: { month: string; enrollments: number }[]
}

export function EnrollmentTrendsChart({ data }: EnrollmentTrendsChartProps) {
    const chartData = data || [
        { month: "Jan", enrollments: 45 },
        { month: "Feb", enrollments: 52 },
        { month: "Mar", enrollments: 48 },
        { month: "Apr", enrollments: 61 },
        { month: "May", enrollments: 55 },
        { month: "Jun", enrollments: 67 },
        { month: "Jul", enrollments: 72 },
        { month: "Aug", enrollments: 85 },
        { month: "Sep", enrollments: 95 },
        { month: "Oct", enrollments: 88 },
        { month: "Nov", enrollments: 76 },
        { month: "Dec", enrollments: 82 },
    ]

    return (
        <Card className="col-span-1 lg:col-span-2 overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Enrollment Trends</CardTitle>
                <CardDescription>Monthly student enrollment numbers for the current year</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "4 4" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="enrollments"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEnrollments)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
