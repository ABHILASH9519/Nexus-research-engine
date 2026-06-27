import { type AgentStep, MessageRole } from "@/backend";
import AgentFlowGraph from "@/components/AgentFlowGraph";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAgentRuns,
  useChatHistory,
  useClearChatHistory,
  useDocuments,
  useProject,
  useSendChatMessage,
  useStartAgentRun,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthSync } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  BookOpen,
  Bookmark,
  Bot,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  StickyNote,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function WorkspacePage() {
  useAuthSync();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setSelectedProject } = useProjectStore();
  const {
    messages,
    isStreaming,
    streamingContent,
    addMessage,
    setIsStreaming,
    setStreamingContent,
    clearChat,
  } = useChatStore();

  const id = projectId ? BigInt(projectId) : null;

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: documents = [], isLoading: docsLoading } = useDocuments(id);
  const { data: chatHistory = [] } = useChatHistory(id);
  const { data: agentRuns = [] } = useAgentRuns(id);

  const sendMessage = useSendChatMessage();
  const clearHistory = useClearChatHistory();
  const startAgentRun = useStartAgentRun();

  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [followExecution, setFollowExecution] = useState(true);
  const [_selectedAgentStep, setSelectedAgentStep] = useState<{
    step: AgentStep;
    run: import("@/backend").AgentRun;
  } | null>(null);

  // Redirect unauthenticated
  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  // Set selected project in store
  if (project) {
    setSelectedProject(project);
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsStreaming(true);
    setStreamingContent("");

    // Add user message locally
    addMessage({
      id: BigInt(Date.now()),
      content,
      role: MessageRole.user,
      projectId: id,
      createdAt: BigInt(Date.now()) * 1_000_000n,
      citations: [],
    });

    try {
      // Simulate streaming by calling the backend
      const response = await sendMessage.mutateAsync({
        projectId: id,
        content,
      });

      // Simulate progressive token delivery
      const fullContent = response.content;
      const chunks = fullContent.split(" ");
      let currentContent = "";

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        currentContent += (i > 0 ? " " : "") + chunks[i];
        setStreamingContent(currentContent);
      }

      addMessage(response);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleClearChat = async () => {
    if (!id) return;
    try {
      await clearHistory.mutateAsync(id);
      clearChat();
      toast.success("Chat history cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  const handleStartAgent = async () => {
    if (!inputValue.trim() || !id) return;
    const query = inputValue.trim();
    setInputValue("");
    try {
      await startAgentRun.mutateAsync({ projectId: id, query });
      toast.success("Agent run started");
      setActiveTab("agents");
    } catch {
      toast.error("Failed to start agent run");
    }
  };

  const formatTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayMessages =
    messages.length > 0 ? messages : chatHistory.length > 0 ? chatHistory : [];

  if (projectLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading workspace..." />
      </div>
    );
  }

  if (!project && !projectLoading) {
    return (
      <GlassCard className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="font-display text-lg font-semibold">
          Project not found
        </h3>
        <GlassButton
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/dashboard")}
          data-ocid="workspace.back_to_dashboard_button"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Project Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent/50"
            data-ocid="workspace.back_button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {project?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {project?.description}
            </p>
          </div>
        </div>

        {/* Workspace Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-subtle">
            <TabsTrigger
              value="chat"
              className="gap-2"
              data-ocid="workspace.chat_tab"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="gap-2"
              data-ocid="workspace.documents_tab"
            >
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="gap-2"
              data-ocid="workspace.agents_tab"
            >
              <Bot className="h-4 w-4" />
              Agent Runs
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="gap-2"
              data-ocid="workspace.notes_tab"
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Chat Panel */}
          <TabsContent value="chat" className="mt-4">
            <div className="flex h-[calc(100vh-16rem)] flex-col gap-4 lg:flex-row">
              {/* Chat Area */}
              <GlassCard className="flex flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <div className="flex items-center gap-1.5 text-xs text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="rounded-md p-1.5 text-muted-foreground transition-smooth hover:bg-accent/50"
                      title="Clear chat"
                      data-ocid="workspace.clear_chat_button"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-4">
                    {displayMessages.length === 0 && !isStreaming && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bot className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          Start a conversation with your AI research assistant.
                        </p>
                      </div>
                    )}

                    {displayMessages.map((msg) => (
                      <motion.div
                        key={msg.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3",
                          msg.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-xl px-4 py-2.5",
                            msg.role === "user"
                              ? "bg-primary/20 text-foreground"
                              : "bg-muted/50 text-foreground",
                          )}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 space-y-1 border-t border-border/30 pt-2">
                              {msg.citations.map((citation) => (
                                <div
                                  key={citation.title}
                                  className="flex items-center gap-1.5 text-xs text-primary"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span className="truncate">
                                    {citation.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <span className="mt-1 block text-right text-[10px] text-muted-foreground">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        {msg.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                            <User className="h-4 w-4 text-accent" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isStreaming && streamingContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="max-w-[80%] rounded-xl bg-muted/50 px-4 py-2.5">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{streamingContent}</ReactMarkdown>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Typing...
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-border/30 p-4">
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent/50"
                      title="Attach document"
                      onClick={() =>
                        toast.info("Document attachment coming soon")
                      }
                      data-ocid="workspace.attach_button"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="relative flex-1">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask a research question..."
                        rows={1}
                        className="max-h-32 min-h-[40px] w-full resize-y rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-smooth focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        data-ocid="workspace.chat_input"
                      />
                    </div>
                    <div className="flex gap-1">
                      {isStreaming ? (
                        <GlassButton
                          variant="outline"
                          size="icon"
                          onClick={() => setIsStreaming(false)}
                          data-ocid="workspace.stop_button"
                        >
                          <Square className="h-4 w-4" />
                        </GlassButton>
                      ) : (
                        <GlassButton
                          variant="default"
                          size="icon"
                          onClick={handleSend}
                          disabled={!inputValue.trim() || sendMessage.isPending}
                          data-ocid="workspace.send_button"
                        >
                          <Send className="h-4 w-4" />
                        </GlassButton>
                      )}
                      <GlassButton
                        glassVariant="hero"
                        size="icon"
                        onClick={handleStartAgent}
                        disabled={!inputValue.trim() || startAgentRun.isPending}
                        title="Run multi-agent workflow"
                        data-ocid="workspace.agent_run_button"
                      >
                        <Sparkles className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Citation Sidebar */}
              <GlassCard className="hidden w-80 flex-col lg:flex">
                <div className="border-b border-border/30 px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Sources & Citations
                  </h3>
                </div>
                <ScrollArea className="flex-1 px-4 py-3">
                  {documents.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={doc.id.toString()}
                          className="rounded-lg border border-border/30 bg-muted/30 p-3"
                          data-ocid={`workspace.citation.item.${index + 1}`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-foreground">
                              {doc.title}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {doc.filename} · {doc.docType}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Documents Panel */}
          <TabsContent value="documents" className="mt-4">
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Document Library
                </h2>
                <GlassButton
                  variant="default"
                  onClick={() => toast.info("Document upload coming soon")}
                  data-ocid="workspace.upload_document_button"
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Upload Document
                </GlassButton>
              </div>

              {docsLoading ? (
                <LoadingSpinner label="Loading documents..." />
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    No documents in this project yet.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload PDFs, DOCX, TXT, or Markdown files.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id.toString()}
                      className="flex items-center justify-between rounded-lg border border-border/30 p-4 transition-smooth hover:bg-accent/20"
                      data-ocid={`workspace.document.item.${index + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.filename} · {doc.docType}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(doc.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Agent Runs Panel */}
          <TabsContent value="agents" className="mt-4">
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Agent Runs
                </h2>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={followExecution}
                      onChange={(e) => setFollowExecution(e.target.checked)}
                      className="rounded border-border/40"
                      data-ocid="workspace.follow_execution_toggle"
                    />
                    Follow Execution
                  </label>
                </div>
              </div>

              {agentRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No agent runs yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start a multi-agent workflow from the Chat tab.
                  </p>
                </div>
              ) : (
                <div className="h-[calc(100vh-20rem)]">
                  <AgentFlowGraph
                    agentRuns={agentRuns}
                    followExecution={followExecution}
                    onNodeClick={(step, run) =>
                      setSelectedAgentStep({ step, run })
                    }
                  />
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Notes Panel */}
          <TabsContent value="notes" className="mt-4">
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Research Notes
                </h2>
                <GlassButton
                  variant="default"
                  onClick={() => toast.info("Note creation coming soon")}
                  data-ocid="workspace.add_note_button"
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  Add Note
                </GlassButton>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">No notes yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create notes to capture insights and findings.
                </p>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
