"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from "recharts"

interface ApplicationFunnelChartProps {
    data?: { stage: string; count: number; percentage: number }[]
}

export function ApplicationFunnelChart({ data }: ApplicationFunnelChartProps) {
    const chartData = data || [
        { stage: "Draft", count: 120, percentage: 100 },
        { stage: "Submitted", count: 85, percentage: 70 },
        { stage: "Review", count: 64, percentage: 53 },
        { stage: "Accepted", count: 42, percentage: 35 },
        { stage: "Enrolled", count: 38, percentage: 31 },
    ]

    const COLORS = [
        "oklch(0.65 0.15 230)", // Info (Blue)
        "oklch(0.75 0.18 75)",  // Warning (Amber)
        "oklch(0.35 0.18 290)", // Primary (Purple)
        "oklch(0.6 0.18 155)",  // Success (Emerald)
        "oklch(0.75 0.17 85)",  // Secondary (Gold)
    ]

    return (
        <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Application Funnel</CardTitle>
                <CardDescription>Conversion from draft to enrollment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="stage"
                            type="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                            }}
                            formatter={(value: any, name: any, props: any) => [
                                `${value} applications (${props.payload.percentage}%)`,
                                "Status"
                            ]}
                        />
                        <Bar
                            dataKey="count"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            animationDuration={1500}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="right"
                                className="fill-muted-foreground text-[10px] font-bold"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
