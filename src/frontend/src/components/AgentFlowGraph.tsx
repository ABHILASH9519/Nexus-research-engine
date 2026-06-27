import type { AgentRun, AgentStatus, AgentStep, AgentType } from "@/backend";
import { GlassCard } from "@/components/GlassCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Background,
  Controls,
  type Edge,
  type EdgeTypes,
  Handle,
  type Node,
  type NodeTypes,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface AgentFlowGraphProps {
  agentRuns: AgentRun[];
  followExecution: boolean;
  onNodeClick?: (step: AgentStep, run: AgentRun) => void;
}

const AGENT_COLORS: Record<AgentType, string> = {
  planner: "#3b82f6",
  search: "#8b5cf6",
  retrieval: "#06b6d4",
  knowledge: "#10b981",
  summarization: "#f59e0b",
  citation: "#ec4899",
  validation: "#6366f1",
  memory: "#14b8a6",
};

const STATUS_CONFIG: Record<
  AgentStatus,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  pending: {
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    label: "Pending",
  },
  running: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: "text-primary",
    bg: "bg-primary/20",
    label: "Running",
  },
  completed: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-success",
    bg: "bg-success/20",
    label: "Completed",
  },
  failed: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "text-destructive",
    bg: "bg-destructive/20",
    label: "Failed",
  },
  retrying: {
    icon: <RotateCcw className="h-3.5 w-3.5 animate-spin" />,
    color: "text-accent",
    bg: "bg-accent/20",
    label: "Retrying",
  },
};

interface AgentNodeData extends Record<string, unknown> {
  step: AgentStep;
  run: AgentRun;
  stepIndex: number;
  onClick: (step: AgentStep, run: AgentRun) => void;
}

function AgentNode({ data }: { data: AgentNodeData }) {
  const { step, run, stepIndex, onClick } = data;
  const status = STATUS_CONFIG[step.status];
  const color = AGENT_COLORS[step.agent];

  return (
    <button
      type="button"
      className={cn(
        "relative min-w-[180px] rounded-xl border p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md text-left",
        step.status === "running"
          ? "border-primary/50 ring-1 ring-primary/30"
          : "border-border/40",
        "bg-card/80 backdrop-blur-sm",
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: color,
      }}
      onClick={() => onClick(step, run)}
      data-ocid={`agent.node.${stepIndex + 1}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 8, height: 8 }}
      />
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            status.bg,
          )}
        >
          <Bot className={cn("h-3.5 w-3.5", status.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground capitalize truncate">
            {step.agent}
          </p>
          <p
            className={cn("text-[10px] flex items-center gap-1", status.color)}
          >
            {status.icon}
            {status.label}
          </p>
        </div>
      </div>
      {step.confidence !== undefined && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Confidence:</span>
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(step.confidence * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span>{Math.round(step.confidence * 100)}%</span>
        </div>
      )}
      {step.tokensUsed !== undefined && step.tokensUsed > 0n && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {step.tokensUsed.toString()} tokens
        </p>
      )}
      {step.error && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-destructive">
          <AlertTriangle className="h-3 w-3" />
          <span className="truncate">{step.error}</span>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, width: 8, height: 8 }}
      />
    </button>
  );
}

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
};

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: string;
}) {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <g>
      <path
        id={id}
        d={`M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${midY} T ${targetX} ${targetY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary/40"
        style={style}
      />
      <circle r="3" fill="currentColor" className="text-primary">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={`M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${midY} T ${targetX} ${targetY}`}
        />
      </circle>
      {markerEnd && (
        <marker
          id={markerEnd.replace("url(#", "").replace(")", "")}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="currentColor"
            className="text-primary/60"
          />
        </marker>
      )}
    </g>
  );
}

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

export default function AgentFlowGraph({
  agentRuns,
  followExecution,
  onNodeClick,
}: AgentFlowGraphProps) {
  const [selectedStep, setSelectedStep] = useState<{
    step: AgentStep;
    run: AgentRun;
  } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, setCenter } = useReactFlow();

  const handleNodeClick = useCallback(
    (step: AgentStep, run: AgentRun) => {
      setSelectedStep({ step, run });
      if (onNodeClick) {
        onNodeClick(step, run);
      }
    },
    [onNodeClick],
  );

  const { nodes, edges } = useMemo(() => {
    const allNodes: Node<AgentNodeData>[] = [];
    const allEdges: Edge[] = [];

    agentRuns.forEach((run, runIndex) => {
      const runOffsetX = runIndex * 300;
      const runOffsetY = 0;

      run.steps.forEach((step, stepIndex) => {
        const nodeId = `${run.id}-${stepIndex}`;
        allNodes.push({
          id: nodeId,
          type: "agentNode",
          position: {
            x: runOffsetX + 50,
            y: runOffsetY + stepIndex * 140,
          },
          data: {
            step,
            run,
            stepIndex,
            onClick: handleNodeClick,
          },
        });

        if (stepIndex > 0) {
          const prevNodeId = `${run.id}-${stepIndex - 1}`;
          allEdges.push({
            id: `${run.id}-edge-${stepIndex}`,
            source: prevNodeId,
            target: nodeId,
            type: "animated",
            animated: step.status === "running" || step.status === "retrying",
            style: {
              stroke:
                step.status === "failed"
                  ? "#ef4444"
                  : step.status === "completed"
                    ? "#22c55e"
                    : "#3b82f6",
              strokeWidth: 2,
              opacity: 0.6,
            },
          });
        }
      });
    });

    return { nodes: allNodes, edges: allEdges };
  }, [agentRuns, handleNodeClick]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  // Auto-follow active node
  useEffect(() => {
    if (!followExecution) return;

    let activeNodeId: string | null = null;
    for (const run of agentRuns) {
      for (let i = 0; i < run.steps.length; i++) {
        if (
          run.steps[i].status === "running" ||
          run.steps[i].status === "retrying"
        ) {
          activeNodeId = `${run.id}-${i}`;
          break;
        }
      }
      if (activeNodeId) break;
    }

    if (activeNodeId) {
      const node = flowNodes.find((n) => n.id === activeNodeId);
      if (node) {
        setCenter(node.position.x + 90, node.position.y + 50, {
          duration: 800,
          zoom: 1.2,
        });
      }
    }
  }, [agentRuns, followExecution, flowNodes, setCenter]);

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  const formatTime = (timestamp?: bigint) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) / 1_000_000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex h-full gap-4">
      <div
        ref={reactFlowWrapper}
        className="flex-1 min-h-[500px] rounded-xl border border-border/30 bg-background/50"
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            gap={20}
            size={1}
            className="bg-background/30"
            color="oklch(var(--border) / 0.3)"
          />
          <Controls className="glass-strong" />
        </ReactFlow>
      </div>

      {/* Details Panel */}
      {selectedStep && (
        <GlassCard className="w-80 flex-shrink-0 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-semibold">Step Details</h3>
            <button
              type="button"
              onClick={() => setSelectedStep(null)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent/50 transition-smooth"
              data-ocid="agent.details.close_button"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Agent
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: AGENT_COLORS[selectedStep.step.agent],
                  }}
                />
                <span className="text-sm font-medium capitalize">
                  {selectedStep.step.agent}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Status
              </p>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                  STATUS_CONFIG[selectedStep.step.status].bg,
                  STATUS_CONFIG[selectedStep.step.status].color,
                )}
              >
                {STATUS_CONFIG[selectedStep.step.status].icon}
                {STATUS_CONFIG[selectedStep.step.status].label}
              </div>
            </div>

            {selectedStep.step.confidence !== undefined && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Confidence
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(selectedStep.step.confidence * 100)}%`,
                        backgroundColor: AGENT_COLORS[selectedStep.step.agent],
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round(selectedStep.step.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {selectedStep.step.tokensUsed !== undefined &&
              selectedStep.step.tokensUsed > 0n && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Tokens Used
                  </p>
                  <p className="text-sm font-medium">
                    {selectedStep.step.tokensUsed.toString()}
                  </p>
                </div>
              )}

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Input
              </p>
              <ScrollArea className="h-24 rounded-lg border border-border/30 bg-muted/30 p-2">
                <p className="text-xs text-foreground">
                  {selectedStep.step.input}
                </p>
              </ScrollArea>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Output
              </p>
              <ScrollArea className="h-24 rounded-lg border border-border/30 bg-muted/30 p-2">
                <p className="text-xs text-foreground">
                  {selectedStep.step.output}
                </p>
              </ScrollArea>
            </div>

            {selectedStep.step.error && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">
                  Error
                </p>
                <p className="text-xs text-destructive">
                  {selectedStep.step.error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground">Started</p>
                <p>{formatTime(selectedStep.step.startedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Completed</p>
                <p>{formatTime(selectedStep.step.completedAt)}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
