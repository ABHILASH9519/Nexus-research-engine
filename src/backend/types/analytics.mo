import Common "./common";

module {

  public type AnalyticsSnapshot = {
    timestamp : Common.Timestamp;
    totalRequests : Nat;
    activeAgents : Nat;
    avgLatencyMs : Nat;
    accuracyScore : Float;
    completionPercentage : Float;
    memoryUtilization : Nat;
    tokenConsumption : Nat;
  };

  public type AgentPerformance = {
    agentType : Text;
    runsToday : Nat;
    avgLatencyMs : Nat;
    successRate : Float;
    tokensConsumed : Nat;
  };

  public type ResearchTrend = {
    date : Text;
    requestCount : Nat;
    tokenUsage : Nat;
    avgAccuracy : Float;
  };

  public type DashboardSummary = {
    totalRequests : Nat;
    activeAgents : Nat;
    avgLatencyMs : Nat;
    accuracyScore : Float;
    completionPercentage : Float;
    memoryUtilization : Nat;
    tokenConsumption : Nat;
    topAgents : [AgentPerformance];
    trends : [ResearchTrend];
  };
};
