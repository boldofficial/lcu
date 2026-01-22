"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts"

interface ProgramDistributionChartProps {
    data?: { name: string; value: number }[]
}

export function ProgramDistributionChart({ data }: ProgramDistributionChartProps) {
    const chartData = data || [
        { name: "Theology", value: 400 },
        { month: "Business", value: 300 },
        { month: "Nursing", value: 300 },
        { month: "Education", value: 200 },
        { month: "Missions", value: 150 },
    ]

    const COLORS = [
        "oklch(0.35 0.18 290)", // Purple
        "oklch(0.75 0.17 85)",  // Gold
        "oklch(0.6 0.18 155)",  // Emerald
        "oklch(0.65 0.2 15)",   // Rose
        "oklch(0.7 0.12 200)",  // Cyan
    ]

    return (
        <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Program Distribution</CardTitle>
                <CardDescription>Student distribution across degree programs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            animationBegin={500}
                            animationDuration={1500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-xs font-medium text-muted-foreground">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
