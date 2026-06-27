import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import _TypesCommon "types/common";
import TypesProjects "types/projects";
import TypesDocuments "types/documents";
import TypesChat "types/chat";
import TypesAgents "types/agents";
import TypesAnalytics "types/analytics";
import TypesConfig "types/config";
import ResearchMixin "mixins/research-api";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include MixinViews();

  let projects : Map.Map<TypesProjects.ProjectId, TypesProjects.Project>;
  let projectIdSeq : { var value : TypesProjects.ProjectId };

  let documents : Map.Map<TypesDocuments.DocumentId, TypesDocuments.Document>;
  let documentIdSeq : { var value : TypesDocuments.DocumentId };

  let chatMessages : List.List<TypesChat.ChatMessage>;
  let messageIdSeq : { var value : TypesChat.MessageId };

  let agentRuns : Map.Map<TypesAgents.AgentRunId, TypesAgents.AgentRun>;
  let agentRunIdSeq : { var value : TypesAgents.AgentRunId };

  let analyticsSnapshots : List.List<TypesAnalytics.AnalyticsSnapshot>;

  let aiConfig : { var value : TypesConfig.AIConfig };

  include ResearchMixin(
    accessControlState,
    projects,
    projectIdSeq,
    documents,
    documentIdSeq,
    chatMessages,
    messageIdSeq,
    agentRuns,
    agentRunIdSeq,
    analyticsSnapshots,
    aiConfig,
  );
};
