import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type OldActor = {};

  type NewActor = {
    accessControlState : { var adminAssigned : Bool; userRoles : Map.Map<Principal, { #guest; #admin; #user }> };
    projects : Map.Map<Nat, { id : Nat; name : Text; description : Text; owner : Principal; status : { #active; #archived }; createdAt : Nat; updatedAt : Nat }>;
    projectIdSeq : { var value : Nat };
    documents : Map.Map<Nat, { id : Nat; projectId : Nat; title : Text; filename : Text; docType : { #pdf; #docx; #txt; #markdown; #csv }; blobRef : Blob; content : Text; keywords : [Text]; owner : Principal; createdAt : Nat; updatedAt : Nat }>;
    documentIdSeq : { var value : Nat };
    chatMessages : List.List<{ id : Nat; projectId : Nat; role : { #user; #assistant; #system_ }; content : Text; citations : [{ documentId : Nat; title : Text; snippet : Text }]; createdAt : Nat }>;
    messageIdSeq : { var value : Nat };
    agentRuns : Map.Map<Nat, { id : Nat; projectId : Nat; query_ : Text; steps : [{ agent : { #planner; #retrieval; #search; #knowledge; #validation; #summarization; #memory; #citation }; status : { #pending; #running; #completed; #failed; #retrying }; input : Text; output : Text; confidence : ?Float; tokensUsed : ?Nat; startedAt : ?Nat; completedAt : ?Nat; error : ?Text }]; finalAnswer : ?Text; status : { #pending; #running; #completed; #failed; #retrying }; createdAt : Nat; updatedAt : Nat }>;
    agentRunIdSeq : { var value : Nat };
    analyticsSnapshots : List.List<{ timestamp : Nat; totalRequests : Nat; activeAgents : Nat; avgLatencyMs : Nat; accuracyScore : Float; completionPercentage : Float; memoryUtilization : Nat; tokenConsumption : Nat }>;
    aiConfig : { var value : { provider : { #openai; #gemini; #anthropic; #custom : Text }; apiEndpoint : Text; apiKey : Text; modelId : Text; maxTokens : Nat; temperature : Float; updatedAt : Nat } };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty<Principal, { #guest; #admin; #user }>();
      };
      projects = Map.empty<Nat, { id : Nat; name : Text; description : Text; owner : Principal; status : { #active; #archived }; createdAt : Nat; updatedAt : Nat }>();
      projectIdSeq = { var value = 0 : Nat };
      documents = Map.empty<Nat, { id : Nat; projectId : Nat; title : Text; filename : Text; docType : { #pdf; #docx; #txt; #markdown; #csv }; blobRef : Blob; content : Text; keywords : [Text]; owner : Principal; createdAt : Nat; updatedAt : Nat }>();
      documentIdSeq = { var value = 0 : Nat };
      chatMessages = List.empty<{ id : Nat; projectId : Nat; role : { #user; #assistant; #system_ }; content : Text; citations : [{ documentId : Nat; title : Text; snippet : Text }]; createdAt : Nat }>();
      messageIdSeq = { var value = 0 : Nat };
      agentRuns = Map.empty<Nat, { id : Nat; projectId : Nat; query_ : Text; steps : [{ agent : { #planner; #retrieval; #search; #knowledge; #validation; #summarization; #memory; #citation }; status : { #pending; #running; #completed; #failed; #retrying }; input : Text; output : Text; confidence : ?Float; tokensUsed : ?Nat; startedAt : ?Nat; completedAt : ?Nat; error : ?Text }]; finalAnswer : ?Text; status : { #pending; #running; #completed; #failed; #retrying }; createdAt : Nat; updatedAt : Nat }>();
      agentRunIdSeq = { var value = 0 : Nat };
      analyticsSnapshots = List.empty<{ timestamp : Nat; totalRequests : Nat; activeAgents : Nat; avgLatencyMs : Nat; accuracyScore : Float; completionPercentage : Float; memoryUtilization : Nat; tokenConsumption : Nat }>();
      aiConfig = {
        var value = {
          provider = #openai : { #openai; #gemini; #anthropic; #custom : Text };
          apiEndpoint = "" : Text;
          apiKey = "" : Text;
          modelId = "" : Text;
          maxTokens = 0 : Nat;
          temperature = 0.0 : Float;
          updatedAt = 0 : Nat;
        };
      };
    };
  };
};
