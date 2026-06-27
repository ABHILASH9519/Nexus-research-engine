import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAgentMetrics, useDashboardSummary } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthSync } from "@/stores/authStore";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Clock,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "oklch(0.65 0.15 195)",
  "oklch(0.70 0.18 85)",
  "oklch(0.60 0.18 25)",
  "oklch(0.6 0.18 150)",
  "oklch(0.5 0.14 270)",
];

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  delay,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <GlassCard className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">
              {value}
            </p>
            {trend && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  trendUp ? "text-success" : "text-destructive",
                )}
              >
                {trendUp ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend}
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  useAuthSync();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: metrics = [], isLoading: metricsLoading } = useAgentMetrics();

  // Redirect unauthenticated
  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  const isLoading = summaryLoading || metricsLoading;

  // Format big numbers
  const formatNumber = (n: bigint | number) => {
    const num = typeof n === "bigint" ? Number(n) : n;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Mock trend data based on summary
  const trendData =
    summary?.trends.map((t) => ({
      date: t.date,
      requests: Number(t.requestCount),
      tokens: Number(t.tokenUsage),
      accuracy: Math.round(t.avgAccuracy * 100),
    })) || [];

  // Agent performance data
  const agentData = metrics.map((m) => ({
    name: m.agent,
    runs: Number(m.totalRuns),
    tokens: Number(m.totalTokens),
    confidence: Math.round(m.avgConfidence * 100),
    successRate: Math.round(m.successRate * 100),
  }));

  // Pie chart data for token distribution
  const tokenPieData = metrics.map((m) => ({
    name: m.agent,
    value: Number(m.totalTokens),
  }));

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor research activity, agent performance, and token usage
            </p>
          </div>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-smooth",
                  timeRange === range
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-accent/30",
                )}
                data-ocid={`analytics.time_range.${range}_tab`}
              >
                {range === "7d"
                  ? "7 Days"
                  : range === "30d"
                    ? "30 Days"
                    : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" label="Loading analytics..." />
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Requests"
                value={formatNumber(summary?.totalRequests || 0)}
                icon={Activity}
                trend="+12% vs last period"
                trendUp={true}
                delay={0}
              />
              <MetricCard
                title="Active Agents"
                value={formatNumber(summary?.activeAgents || 0)}
                icon={Bot}
                trend="+5% vs last period"
                trendUp={true}
                delay={0.05}
              />
              <MetricCard
                title="Avg Latency"
                value={`${formatNumber(summary?.avgLatencyMs || 0)}ms`}
                icon={Clock}
                trend="-8% vs last period"
                trendUp={false}
                delay={0.1}
              />
              <MetricCard
                title="Accuracy Score"
                value={`${Math.round((summary?.accuracyScore || 0) * 100)}%`}
                icon={Target}
                trend="+3% vs last period"
                trendUp={true}
                delay={0.15}
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Token Usage Trend */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold">
                      Token Usage Trend
                    </h3>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient
                          id="tokenGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.65 0.15 195)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.65 0.15 195)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(var(--card))",
                          border: "1px solid oklch(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tokens"
                        stroke="oklch(0.65 0.15 195)"
                        fill="url(#tokenGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>

              {/* Request Volume */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold">
                      Request Volume
                    </h3>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(var(--card))",
                          border: "1px solid oklch(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="requests"
                        fill="oklch(0.70 0.18 85)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Agent Performance */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold">
                      Agent Performance
                    </h3>
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={agentData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(var(--border))"
                      />
                      <XAxis
                        type="number"
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="oklch(var(--muted-foreground))"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(var(--card))",
                          border: "1px solid oklch(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="successRate"
                        fill="oklch(0.65 0.15 195)"
                        radius={[0, 4, 4, 0]}
                        name="Success Rate %"
                      />
                      <Bar
                        dataKey="confidence"
                        fill="oklch(0.70 0.18 85)"
                        radius={[0, 4, 4, 0]}
                        name="Confidence %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>

              {/* Token Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <GlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold">
                      Token Distribution
                    </h3>
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={tokenPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {tokenPieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              COLORS[
                                tokenPieData.indexOf(entry) % COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(var(--card))",
                          border: "1px solid oklch(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                    {tokenPieData.map((entry, index) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Top Agents Table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold">
                    Top Performing Agents
                  </h3>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="pb-2 text-left font-medium text-muted-foreground">
                          Agent
                        </th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">
                          Runs
                        </th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">
                          Tokens
                        </th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">
                          Avg Latency
                        </th>
                        <th className="pb-2 text-right font-medium text-muted-foreground">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {(summary?.topAgents || []).map((agent, index) => (
                        <tr
                          key={agent.agentType}
                          data-ocid={`analytics.top_agent.item.${index + 1}`}
                        >
                          <td className="py-3 font-medium text-foreground">
                            {agent.agentType}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formatNumber(agent.runsToday)}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formatNumber(agent.tokensConsumed)}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formatNumber(agent.avgLatencyMs)}ms
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-xs font-medium",
                                agent.successRate >= 0.9
                                  ? "bg-success/20 text-success"
                                  : agent.successRate >= 0.7
                                    ? "bg-primary/20 text-primary"
                                    : "bg-destructive/20 text-destructive",
                              )}
                            >
                              {Math.round(agent.successRate * 100)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(summary?.topAgents || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No agent data available yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
