import Common "./common";
import Projects "./projects";

module {

  public type AgentRunId = Projects.AgentRunId;
  public type AgentType = {
    #planner;
    #retrieval;
    #search;
    #knowledge;
    #validation;
    #summarization;
    #memory;
    #citation;
  };

  public type AgentStatus = {
    #pending;
    #running;
    #completed;
    #failed;
    #retrying;
  };

  public type AgentStep = {
    agent : AgentType;
    status : AgentStatus;
    input : Text;
    output : Text;
    confidence : ?Float;
    tokensUsed : ?Nat;
    startedAt : ?Common.Timestamp;
    completedAt : ?Common.Timestamp;
    error : ?Text;
  };

  public type AgentRun = {
    id : AgentRunId;
    projectId : Projects.ProjectId;
    query_ : Text;
    steps : [AgentStep];
    finalAnswer : ?Text;
    status : AgentStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type AgentMetrics = {
    agent : AgentType;
    totalRuns : Nat;
    totalTokens : Nat;
    avgDurationMs : Nat;
    avgConfidence : Float;
    successRate : Float;
  };
};
