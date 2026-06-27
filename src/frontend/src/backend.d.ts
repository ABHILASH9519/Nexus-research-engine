import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type AgentRunId = bigint;
export interface SearchResult {
    title: string;
    snippet: string;
    score: bigint;
    documentId: DocumentId;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface HttpRequestResult {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export interface DocumentMetadata {
    id: DocumentId;
    title: string;
    owner: UserId;
    createdAt: Timestamp;
    filename: string;
    updatedAt: Timestamp;
    projectId: ProjectId;
    docType: DocumentType;
}
export interface Document {
    id: DocumentId;
    title: string;
    content: string;
    owner: UserId;
    blobRef: Uint8Array;
    createdAt: Timestamp;
    filename: string;
    keywords: Array<string>;
    updatedAt: Timestamp;
    projectId: ProjectId;
    docType: DocumentType;
}
export interface AgentPerformance {
    successRate: number;
    agentType: string;
    runsToday: bigint;
    tokensConsumed: bigint;
    avgLatencyMs: bigint;
}
export interface AIConfigPublic {
    provider: AIProvider;
    temperature: number;
    updatedAt: bigint;
    apiEndpoint: string;
    maxTokens: bigint;
    modelId: string;
}
export interface AgentRun {
    id: AgentRunId;
    status: AgentStatus;
    createdAt: Timestamp;
    query: string;
    updatedAt: Timestamp;
    steps: Array<AgentStep>;
    projectId: ProjectId;
    finalAnswer?: string;
}
export interface AnalyticsSnapshot {
    completionPercentage: number;
    timestamp: Timestamp;
    accuracyScore: number;
    activeAgents: bigint;
    avgLatencyMs: bigint;
    tokenConsumption: bigint;
    memoryUtilization: bigint;
    totalRequests: bigint;
}
export interface ResearchTrend {
    tokenUsage: bigint;
    avgAccuracy: number;
    date: string;
    requestCount: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: HttpRequestResult;
}
export type DocumentId = bigint;
export interface Citation {
    title: string;
    snippet: string;
    documentId: DocumentId;
}
export interface ChatMessage {
    id: MessageId;
    content: string;
    createdAt: Timestamp;
    role: MessageRole;
    projectId: ProjectId;
    citations: Array<Citation>;
}
export type AIProvider = {
    __kind__: "openai";
    openai: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "gemini";
    gemini: null;
} | {
    __kind__: "anthropic";
    anthropic: null;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface DashboardSummary {
    topAgents: Array<AgentPerformance>;
    trends: Array<ResearchTrend>;
    completionPercentage: number;
    accuracyScore: number;
    activeAgents: bigint;
    avgLatencyMs: bigint;
    tokenConsumption: bigint;
    memoryUtilization: bigint;
    totalRequests: bigint;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface AIConfig {
    provider: AIProvider;
    temperature: number;
    updatedAt: bigint;
    apiEndpoint: string;
    apiKey: string;
    maxTokens: bigint;
    modelId: string;
}
export type UserId = Principal;
export interface AgentMetrics {
    agent: AgentType;
    successRate: number;
    avgConfidence: number;
    totalTokens: bigint;
    totalRuns: bigint;
    avgDurationMs: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type MessageId = bigint;
export type ProjectId = bigint;
export interface AgentStep {
    status: AgentStatus;
    completedAt?: Timestamp;
    output: string;
    startedAt?: Timestamp;
    agent: AgentType;
    tokensUsed?: bigint;
    error?: string;
    input: string;
    confidence?: number;
}
export interface Project {
    id: ProjectId;
    status: ProjectStatus;
    owner: UserId;
    name: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
}
export interface ProjectSummary {
    id: ProjectId;
    status: ProjectStatus;
    name: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
}
export enum AgentStatus {
    pending = "pending",
    retrying = "retrying",
    completed = "completed",
    failed = "failed",
    running = "running"
}
export enum AgentType {
    memory = "memory",
    search = "search",
    planner = "planner",
    summarization = "summarization",
    retrieval = "retrieval",
    citation = "citation",
    knowledge = "knowledge",
    validation = "validation"
}
export enum DocumentType {
    csv = "csv",
    pdf = "pdf",
    txt = "txt",
    docx = "docx",
    markdown = "markdown"
}
export enum MessageRole {
    user = "user",
    assistant = "assistant",
    system = "system"
}
export enum ProjectStatus {
    active = "active",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    archiveProject(id: ProjectId): Promise<Project | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearChatHistory(projectId: ProjectId): Promise<void>;
    createProject(name: string, description: string): Promise<Project>;
    deleteDocument(id: DocumentId): Promise<boolean>;
    deleteProject(id: ProjectId): Promise<boolean>;
    duplicateProject(id: ProjectId): Promise<Project | null>;
    getAIConfig(): Promise<AIConfigPublic>;
    getAgentMetrics(): Promise<Array<AgentMetrics>>;
    getAgentRun(id: AgentRunId): Promise<AgentRun | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(projectId: ProjectId): Promise<Array<ChatMessage>>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getDocument(id: DocumentId): Promise<Document | null>;
    getProject(id: ProjectId): Promise<Project | null>;
    isAIConfigured(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAgentRuns(projectId: ProjectId): Promise<Array<AgentRun>>;
    listDocuments(projectId: ProjectId): Promise<Array<DocumentMetadata>>;
    listProjects(): Promise<Array<ProjectSummary>>;
    recordAnalytics(snapshot: AnalyticsSnapshot): Promise<void>;
    searchDocuments(projectId: ProjectId, query: string): Promise<Array<SearchResult>>;
    sendChatMessage(projectId: ProjectId, content: string): Promise<ChatMessage>;
    setAIConfig(config: AIConfig): Promise<void>;
    startAgentRun(projectId: ProjectId, query: string): Promise<AgentRun>;
    transform(raw: TransformationInput): Promise<TransformationOutput>;
    updateProject(id: ProjectId, name: string, description: string): Promise<Project | null>;
    uploadDocument(projectId: ProjectId, title: string, filename: string, docType: DocumentType, blobRef: ExternalBlob, content: string): Promise<Document>;
}
