import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Option "mo:core/Option";
import Common "../types/common";
import Agents "../types/agents";
import Projects "../types/projects";

module {

  public type AgentRunId = Agents.AgentRunId;
  public type ProjectId = Projects.ProjectId;

  public func createRun(
    id : AgentRunId,
    projectId : ProjectId,
    queryText : Text,
    now : Common.Timestamp,
  ) : Agents.AgentRun {
    {
      id;
      projectId;
      query_ = queryText;
      steps = [];
      finalAnswer = null;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
  };

  public func addStep(
    run : Agents.AgentRun,
    step : Agents.AgentStep,
  ) : Agents.AgentRun {
    {
      run with
      steps = run.steps.concat([step]);
      updatedAt = run.updatedAt;
    };
  };

  public func finalizeRun(
    run : Agents.AgentRun,
    answer : Text,
    now : Common.Timestamp,
  ) : Agents.AgentRun {
    {
      run with
      finalAnswer = ?answer;
      status = #completed;
      updatedAt = now;
    };
  };

  public func computeMetrics(runs : [Agents.AgentRun]) : [Agents.AgentMetrics] {
    let agentTypes : [Agents.AgentType] = [
      #planner,
      #retrieval,
      #search,
      #knowledge,
      #validation,
      #summarization,
      #memory,
      #citation,
    ];

    agentTypes.map<Agents.AgentType, Agents.AgentMetrics>(
      func(agentType) {
        var totalRuns : Nat = 0;
        var totalTokens : Nat = 0;
        var totalDurationMs : Nat = 0;
        var totalConfidence : Float = 0.0;
        var successCount : Nat = 0;
        var stepCount : Nat = 0;

        for (run in runs.values()) {
          for (step in run.steps.values()) {
            if (step.agent == agentType) {
              stepCount += 1;
              totalRuns += 1;
              totalTokens += step.tokensUsed.get(0);
              switch (step.startedAt, step.completedAt) {
                case (?start, ?end) {
                  totalDurationMs += Nat.sub(end, start);
                };
                case _ {};
              };
              switch (step.confidence) {
                case (?c) { totalConfidence += c };
                case null {};
              };
              if (step.status == #completed) {
                successCount += 1;
              };
            };
          };
        };

        let avgDurationMs = if (stepCount == 0) 0 else totalDurationMs / stepCount;
        let avgConfidence = if (stepCount == 0) 0.0 else totalConfidence / stepCount.toFloat();
        let successRate = if (stepCount == 0) 0.0 else successCount.toFloat() / stepCount.toFloat();

        {
          agent = agentType;
          totalRuns;
          totalTokens;
          avgDurationMs;
          avgConfidence;
          successRate;
        };
      },
    );
  };
};
