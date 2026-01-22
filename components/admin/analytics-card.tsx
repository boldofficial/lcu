import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminAnalyticsCardProps {
    title: string
    value: string | number
    description: string
    icon: LucideIcon
    trend?: string
    trendUp?: boolean
    gradient?: "purple" | "gold" | "emerald" | "rose" | "cyan"
}

export function AdminAnalyticsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendUp,
    gradient
}: AdminAnalyticsCardProps) {

    const gradients = {
        purple: "from-purple-600/20 to-purple-900/10 dark:from-purple-500/30 dark:to-purple-800/20",
        gold: "from-amber-400/20 to-amber-600/10 dark:from-amber-400/30 dark:to-amber-600/20",
        emerald: "from-emerald-500/20 to-emerald-700/10 dark:from-emerald-500/30 dark:to-emerald-700/20",
        rose: "from-rose-500/20 to-rose-700/10 dark:from-rose-500/30 dark:to-rose-700/20",
        cyan: "from-cyan-500/20 to-cyan-700/10 dark:from-cyan-500/30 dark:to-cyan-700/20",
    }

    const iconColors = {
        purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
        gold: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50",
        cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50",
    }

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-none",
            gradient && "bg-gradient-to-br",
            gradient && gradients[gradient],
            !gradient && "bg-card"
        )}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 hover:rotate-12",
                        gradient ? iconColors[gradient] : "bg-primary/10 text-primary"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <div
                            className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                trendUp
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
                            )}
                        >
                            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-1">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}
