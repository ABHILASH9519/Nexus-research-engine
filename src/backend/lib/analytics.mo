import Text "mo:core/Text";
import Analytics "../types/analytics";
import Agents "../types/agents";

module {

  public func recordRequest(snapshot : Analytics.AnalyticsSnapshot) : Analytics.AnalyticsSnapshot {
    snapshot;
  };

  public func computeDashboard(
    snapshots : [Analytics.AnalyticsSnapshot],
    agentMetrics : [Agents.AgentMetrics],
  ) : Analytics.DashboardSummary {
    let topAgents = agentMetrics.map(func(m : Agents.AgentMetrics) : Analytics.AgentPerformance {
      {
        agentType = switch (m.agent) {
          case (#planner) "planner";
          case (#retrieval) "retrieval";
          case (#search) "search";
          case (#knowledge) "knowledge";
          case (#validation) "validation";
          case (#summarization) "summarization";
          case (#memory) "memory";
          case (#citation) "citation";
        };
        runsToday = m.totalRuns;
        avgLatencyMs = m.avgDurationMs;
        successRate = m.successRate;
        tokensConsumed = m.totalTokens;
      };
    });

    if (snapshots.size() == 0) {
      return {
        totalRequests = 0;
        activeAgents = 0;
        avgLatencyMs = 0;
        accuracyScore = 0.0;
        completionPercentage = 0.0;
        memoryUtilization = 0;
        tokenConsumption = 0;
        topAgents = topAgents;
        trends = [];
      };
    };

    let totalRequests = snapshots.foldLeft(
      0,
      func(acc, s) { acc + s.totalRequests },
    );
    let totalLatency = snapshots.foldLeft(
      0,
      func(acc, s) { acc + s.avgLatencyMs },
    );
    let totalAccuracy = snapshots.foldLeft(
      0.0,
      func(acc, s) { acc + s.accuracyScore },
    );
    let totalCompletion = snapshots.foldLeft(
      0.0,
      func(acc, s) { acc + s.completionPercentage },
    );
    let totalMemory = snapshots.foldLeft(
      0,
      func(acc, s) { acc + s.memoryUtilization },
    );
    let totalTokens = snapshots.foldLeft(
      0,
      func(acc, s) { acc + s.tokenConsumption },
    );

    let count = snapshots.size();
    let latest = snapshots[snapshots.size() - 1];

    // Build daily trends from snapshots grouped by date.
    // Timestamps are nanoseconds, so each day contains 86,400,000,000,000 ns.
    let dayNanos : Nat = 86400000000000;
    var trendMap : [(Text, Analytics.ResearchTrend)] = [];

    for (s in snapshots.values()) {
      let dayIndex = s.timestamp / dayNanos;
      let dateKey = dayIndex.toText();

      switch (trendMap.find(func((key, _)) { key == dateKey })) {
        case (?(_, trend)) {
          let combinedRequests = trend.requestCount + s.totalRequests;
          let combinedAccuracy = if (combinedRequests == 0) {
            trend.avgAccuracy;
          } else {
            (trend.avgAccuracy * trend.requestCount.toFloat()
              + s.accuracyScore * s.totalRequests.toFloat())
              / combinedRequests.toFloat();
          };
          let updatedTrend : Analytics.ResearchTrend = {
            date = trend.date;
            requestCount = combinedRequests;
            tokenUsage = trend.tokenUsage + s.tokenConsumption;
            avgAccuracy = combinedAccuracy;
          };
          trendMap := trendMap.map<(Text, Analytics.ResearchTrend), (Text, Analytics.ResearchTrend)>(
            func((key, value)) {
              if (key == dateKey) { (key, updatedTrend) } else { (key, value) };
            },
          );
        };
        case null {
          trendMap := trendMap.concat([(
            dateKey,
            {
              date = dateKey;
              requestCount = s.totalRequests;
              tokenUsage = s.tokenConsumption;
              avgAccuracy = s.accuracyScore;
            },
          )]);
        };
      };
    };

    let trends = trendMap.map(func((_, trend)) { trend });

    {
      totalRequests;
      activeAgents = latest.activeAgents;
      avgLatencyMs = totalLatency / count;
      accuracyScore = totalAccuracy / count.toFloat();
      completionPercentage = totalCompletion / count.toFloat();
      memoryUtilization = totalMemory / count;
      tokenConsumption = totalTokens;
      topAgents;
      trends;
    };
  };
};
