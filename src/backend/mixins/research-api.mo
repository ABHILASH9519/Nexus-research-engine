import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import Storage "mo:caffeineai-object-storage/Storage";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import TypesCommon "../types/common";
import TypesProjects "../types/projects";
import TypesDocuments "../types/documents";
import TypesChat "../types/chat";
import TypesAgents "../types/agents";
import TypesAnalytics "../types/analytics";
import TypesConfig "../types/config";
import ProjectsLib "../lib/projects";
import DocumentsLib "../lib/documents";
import ChatLib "../lib/chat";
import AgentsLib "../lib/agents";
import AnalyticsLib "../lib/analytics";
import ConfigLib "../lib/config";
import OpenAILib "../lib/openai";

mixin (
  accessControlState : AccessControl.AccessControlState,
  projects : Map.Map<TypesProjects.ProjectId, TypesProjects.Project>,
  projectIdSeq : { var value : TypesProjects.ProjectId },
  documents : Map.Map<TypesDocuments.DocumentId, TypesDocuments.Document>,
  documentIdSeq : { var value : TypesDocuments.DocumentId },
  chatMessages : List.List<TypesChat.ChatMessage>,
  messageIdSeq : { var value : TypesChat.MessageId },
  agentRuns : Map.Map<TypesAgents.AgentRunId, TypesAgents.AgentRun>,
  agentRunIdSeq : { var value : TypesAgents.AgentRunId },
  analyticsSnapshots : List.List<TypesAnalytics.AnalyticsSnapshot>,
  aiConfig : { var value : TypesConfig.AIConfig },
) {
  public query func transform(raw : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(raw);
  };

  // ─── Projects ───

  public shared ({ caller }) func createProject(name : Text, description : Text) : async TypesProjects.Project {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let now = Time.now() |> _.toNat();
    let id = projectIdSeq.value;
    projectIdSeq.value += 1;
    let project = ProjectsLib.createProject(id, name, description, caller, now);
    projects.add(id, project);
    project;
  };

  public query ({ caller }) func listProjects() : async [TypesProjects.ProjectSummary] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = projects.values() |> _.toArray();
    let owned = all.filter(func(p) { p.owner == caller });
    owned.map<TypesProjects.Project, TypesProjects.ProjectSummary>(ProjectsLib.toSummary);
  };

  public query ({ caller }) func getProject(id : TypesProjects.ProjectId) : async ?TypesProjects.Project {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(id)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
        ?p;
      };
      case null null;
    };
  };

  public shared ({ caller }) func updateProject(id : TypesProjects.ProjectId, name : Text, description : Text) : async ?TypesProjects.Project {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(id)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
        let now = Time.now() |> _.toNat();
        let updated = { p with name; description; updatedAt = now };
        projects.add(id, updated);
        ?updated;
      };
      case null null;
    };
  };

  public shared ({ caller }) func archiveProject(id : TypesProjects.ProjectId) : async ?TypesProjects.Project {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(id)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
        let updated = ProjectsLib.archiveProject(p);
        projects.add(id, updated);
        ?updated;
      };
      case null null;
    };
  };

  public shared ({ caller }) func duplicateProject(id : TypesProjects.ProjectId) : async ?TypesProjects.Project {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(id)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
        let now = Time.now() |> _.toNat();
        let newId = projectIdSeq.value;
        projectIdSeq.value += 1;
        let copy = ProjectsLib.duplicateProject(p, newId, now);
        projects.add(newId, copy);
        ?copy;
      };
      case null null;
    };
  };

  public shared ({ caller }) func deleteProject(id : TypesProjects.ProjectId) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(id)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
        // Delete associated documents
        let docs = documents.values() |> _.toArray();
        for (doc in docs.values()) {
          if (doc.projectId == id) {
            documents.remove(doc.id);
          };
        };
        // Delete associated chat messages
        let msgs = chatMessages.toArray();
        chatMessages.clear();
        for (msg in msgs.values()) {
          if (msg.projectId != id) {
            chatMessages.add(msg);
          };
        };
        // Delete associated agent runs
        let runs = agentRuns.values() |> _.toArray();
        for (run in runs.values()) {
          if (run.projectId == id) {
            agentRuns.remove(run.id);
          };
        };
        projects.remove(id);
        true;
      };
      case null false;
    };
  };

  // ─── Documents ───

  public shared ({ caller }) func uploadDocument(
    projectId : TypesProjects.ProjectId,
    title : Text,
    filename : Text,
    docType : TypesDocuments.DocumentType,
    blobRef : Storage.ExternalBlob,
    content : Text,
  ) : async TypesDocuments.Document {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(projectId)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
      };
      case null Runtime.trap("Project not found");
    };
    let now = Time.now() |> _.toNat();
    let id = documentIdSeq.value;
    documentIdSeq.value += 1;
    let doc = DocumentsLib.createDocument(id, projectId, title, filename, docType, blobRef, content, caller, now);
    documents.add(id, doc);
    doc;
  };

  public query ({ caller }) func listDocuments(projectId : TypesProjects.ProjectId) : async [TypesDocuments.DocumentMetadata] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = documents.values() |> _.toArray();
    let projectDocs = all.filter(func(d) { d.projectId == projectId });
    projectDocs.map<TypesDocuments.Document, TypesDocuments.DocumentMetadata>(DocumentsLib.toMetadata);
  };

  public query ({ caller }) func getDocument(id : TypesDocuments.DocumentId) : async ?TypesDocuments.Document {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    documents.get(id);
  };

  public shared ({ caller }) func deleteDocument(id : TypesDocuments.DocumentId) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (documents.get(id)) {
      case (?d) {
        if (d.owner != caller) {
          Runtime.trap("Unauthorized: Not your document");
        };
        documents.remove(id);
        true;
      };
      case null false;
    };
  };

  public query ({ caller }) func searchDocuments(projectId : TypesProjects.ProjectId, query_ : Text) : async [TypesDocuments.SearchResult] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = documents.values() |> _.toArray();
    let projectDocs = all.filter(func(d) { d.projectId == projectId });
    DocumentsLib.searchDocuments(query_, projectDocs);
  };

  // ─── Chat ───

  public shared ({ caller }) func sendChatMessage(projectId : TypesProjects.ProjectId, content : Text) : async TypesChat.ChatMessage {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(projectId)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
      };
      case null Runtime.trap("Project not found");
    };

    let now = Time.now() |> _.toNat();
    let msgId = messageIdSeq.value;
    messageIdSeq.value += 1;

    // Store user message
    let userMsg = ChatLib.createMessage(msgId, projectId, #user, content, [], now);
    chatMessages.add(userMsg);

    // Build context from documents
    let allDocs = documents.values() |> _.toArray();
    let projectDocs = allDocs.filter(func(d) { d.projectId == projectId });
    var context = "";
    for (doc in projectDocs.values()) {
      context := context # "Document: " # doc.title # "\n" # doc.content # "\n\n";
    };

    // Get chat history for this project
    let allMsgs = chatMessages.toArray();
    let projectMsgs = allMsgs.filter(func(m) { m.projectId == projectId });

    // Build prompt and get AI response
    let prompt = ChatLib.buildPrompt(projectMsgs, context);

    // Get AI response
    let config = aiConfig.value;
    if (not ConfigLib.validateConfig(config)) {
      Runtime.trap("AI configuration is invalid");
    };
    if (config.apiKey == "") {
      Runtime.trap("AI API key is not configured");
    };

    let aiResponse = await* OpenAILib.runChatCompletion(config, prompt, transform);

    // Create citations from top search results
    let searchResults = DocumentsLib.searchDocuments(content, projectDocs);
    let citations = searchResults.sliceToArray(0, Nat.min(3, searchResults.size())).map(
      func(r) {
        {
          documentId = r.documentId;
          title = r.title;
          snippet = r.snippet;
        };
      },
    );

    let assistantId = messageIdSeq.value;
    messageIdSeq.value += 1;
    let assistantMsg = ChatLib.createMessage(assistantId, projectId, #assistant, aiResponse, citations, now);
    chatMessages.add(assistantMsg);

    assistantMsg;
  };

  public query ({ caller }) func getChatHistory(projectId : TypesProjects.ProjectId) : async [TypesChat.ChatMessage] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = chatMessages.toArray();
    all.filter<TypesChat.ChatMessage>(func(m) { m.projectId == projectId });
  };

  public shared ({ caller }) func clearChatHistory(projectId : TypesProjects.ProjectId) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = chatMessages.toArray();
    chatMessages.clear();
    for (msg in all.values()) {
      if (msg.projectId != projectId) {
        chatMessages.add(msg);
      };
    };
  };

  // ─── Agent Workflow ───

  public shared ({ caller }) func startAgentRun(projectId : TypesProjects.ProjectId, query_ : Text) : async TypesAgents.AgentRun {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    switch (projects.get(projectId)) {
      case (?p) {
        if (p.owner != caller) {
          Runtime.trap("Unauthorized: Not your project");
        };
      };
      case null Runtime.trap("Project not found");
    };

    let now = Time.now() |> _.toNat();
    let id = agentRunIdSeq.value;
    agentRunIdSeq.value += 1;

    var run = AgentsLib.createRun(id, projectId, query_, now);

    // Simulate agent workflow steps
    let steps : [TypesAgents.AgentStep] = [
      {
        agent = #planner;
        status = #completed;
        input = query_;
        output = "Plan: Break down research into subtasks";
        confidence = ?0.95;
        tokensUsed = ?150;
        startedAt = ?now;
        completedAt = ?(now + 100);
        error = null;
      },
      {
        agent = #retrieval;
        status = #completed;
        input = query_;
        output = "Retrieved relevant documents from knowledge base";
        confidence = ?0.88;
        tokensUsed = ?200;
        startedAt = ?(now + 100);
        completedAt = ?(now + 200);
        error = null;
      },
      {
        agent = #search;
        status = #completed;
        input = query_;
        output = "Found supporting evidence from external sources";
        confidence = ?0.82;
        tokensUsed = ?180;
        startedAt = ?(now + 200);
        completedAt = ?(now + 300);
        error = null;
      },
      {
        agent = #knowledge;
        status = #completed;
        input = query_;
        output = "Fused and organized retrieved information";
        confidence = ?0.90;
        tokensUsed = ?120;
        startedAt = ?(now + 300);
        completedAt = ?(now + 400);
        error = null;
      },
      {
        agent = #validation;
        status = #completed;
        input = query_;
        output = "Cross-checked information; confidence score assigned";
        confidence = ?0.85;
        tokensUsed = ?100;
        startedAt = ?(now + 400);
        completedAt = ?(now + 500);
        error = null;
      },
      {
        agent = #summarization;
        status = #completed;
        input = query_;
        output = "Generated concise summary and report";
        confidence = ?0.92;
        tokensUsed = ?250;
        startedAt = ?(now + 500);
        completedAt = ?(now + 600);
        error = null;
      },
      {
        agent = #citation;
        status = #completed;
        input = query_;
        output = "Added source references and citations";
        confidence = ?0.98;
        tokensUsed = ?80;
        startedAt = ?(now + 600);
        completedAt = ?(now + 700);
        error = null;
      },
    ];

    for (step in steps.values()) {
      run := AgentsLib.addStep(run, step);
    };

    let finalAnswer = "Based on the research, here is a comprehensive answer to your query: \"" # query_ # "\". The analysis involved multiple specialized agents that retrieved, validated, and synthesized information from various sources.";
    run := AgentsLib.finalizeRun(run, finalAnswer, now + 700);

    agentRuns.add(id, run);
    run;
  };

  public query ({ caller }) func getAgentRun(id : TypesAgents.AgentRunId) : async ?TypesAgents.AgentRun {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    agentRuns.get(id);
  };

  public query ({ caller }) func listAgentRuns(projectId : TypesProjects.ProjectId) : async [TypesAgents.AgentRun] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = agentRuns.values() |> _.toArray();
    all.filter<TypesAgents.AgentRun>(func(r) { r.projectId == projectId });
  };

  public query ({ caller }) func getAgentMetrics() : async [TypesAgents.AgentMetrics] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let all = agentRuns.values() |> _.toArray();
    AgentsLib.computeMetrics(all);
  };

  // ─── Analytics ───

  public query ({ caller }) func getDashboardSummary() : async TypesAnalytics.DashboardSummary {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let snapshots = analyticsSnapshots.toArray();
    let allRuns = agentRuns.values() |> _.toArray();
    let metrics = AgentsLib.computeMetrics(allRuns);
    AnalyticsLib.computeDashboard(snapshots, metrics);
  };

  public shared ({ caller }) func recordAnalytics(snapshot : TypesAnalytics.AnalyticsSnapshot) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record analytics");
    };
    analyticsSnapshots.add(snapshot);
  };

  // ─── Config ───

  public shared ({ caller }) func setAIConfig(config : TypesConfig.AIConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set AI configuration");
    };
    if (not ConfigLib.validateConfig(config)) {
      Runtime.trap("Invalid AI configuration");
    };
    let now = Time.now() |> _.toNat();
    aiConfig.value := { config with updatedAt = now };
  };

  public query ({ caller }) func getAIConfig() : async TypesConfig.AIConfigPublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    TypesConfig.toPublic(aiConfig.value);
  };

  public query ({ caller }) func isAIConfigured() : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let config = aiConfig.value;
    config.apiKey != "" and ConfigLib.validateConfig(config);
  };
};
