import { createActor } from "@/backend";
import type {
  AIConfig,
  AIConfigPublic,
  AgentMetrics,
  AgentRun,
  AgentRunId,
  AnalyticsSnapshot,
  ChatMessage,
  DashboardSummary,
  Document,
  DocumentId,
  DocumentMetadata,
  Project,
  ProjectId,
  ProjectSummary,
  SearchResult,
  UserRole,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ProjectSummary[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProject(id: ProjectId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Project | null>({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProject(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: ProjectId;
      name: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProject(id, name, description);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useArchiveProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProjectId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.archiveProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDuplicateProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProjectId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.duplicateProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProjectId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDocuments(projectId: ProjectId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DocumentMetadata[]>({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.listDocuments(projectId);
    },
    enabled: !!actor && !isFetching && projectId !== null,
  });
}

export function useDocument(id: DocumentId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Document | null>({
    queryKey: ["document", id],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getDocument(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDeleteDocument() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: DocumentId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useSearchDocuments(projectId: ProjectId | null) {
  const { actor } = useActor(createActor);
  return useQuery<SearchResult[]>({
    queryKey: ["searchDocuments", projectId],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.searchDocuments(projectId, "");
    },
    enabled: false,
  });
}

export function useChatHistory(projectId: ProjectId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory", projectId],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.getChatHistory(projectId);
    },
    enabled: !!actor && !isFetching && projectId !== null,
  });
}

export function useSendChatMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      content,
    }: {
      projectId: ProjectId;
      content: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendChatMessage(projectId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", variables.projectId],
      });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: ProjectId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearChatHistory(projectId);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", projectId],
      });
    },
  });
}

export function useAgentRuns(projectId: ProjectId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AgentRun[]>({
    queryKey: ["agentRuns", projectId],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.listAgentRuns(projectId);
    },
    enabled: !!actor && !isFetching && projectId !== null,
  });
}

export function useAgentRun(id: AgentRunId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AgentRun | null>({
    queryKey: ["agentRun", id],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAgentRun(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useStartAgentRun() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      query,
    }: {
      projectId: ProjectId;
      query: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.startAgentRun(projectId, query);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agentRuns", variables.projectId],
      });
    },
  });
}

export function useAgentMetrics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AgentMetrics[]>({
    queryKey: ["agentMetrics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAgentMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardSummary>({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      if (!actor)
        return {
          topAgents: [],
          trends: [],
          completionPercentage: 0,
          accuracyScore: 0,
          activeAgents: 0n,
          avgLatencyMs: 0n,
          tokenConsumption: 0n,
          memoryUtilization: 0n,
          totalRequests: 0n,
        };
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordAnalytics() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (snapshot: AnalyticsSnapshot) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordAnalytics(snapshot);
    },
  });
}

export function useAIConfig() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AIConfigPublic>({
    queryKey: ["aiConfig"],
    queryFn: async () => {
      if (!actor)
        return {
          provider: { __kind__: "openai", openai: null },
          temperature: 0.7,
          updatedAt: 0n,
          apiEndpoint: "",
          maxTokens: 2048n,
          modelId: "gpt-4",
        };
      return actor.getAIConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAIConfig() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: AIConfig) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setAIConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConfig"] });
    },
  });
}

export function useIsAIConfigured() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAIConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAIConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
