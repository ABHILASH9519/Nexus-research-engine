import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useArchiveProject,
  useCreateProject,
  useDeleteProject,
  useDuplicateProject,
  useProjects,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthSync } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  Archive,
  Bot,
  Clock,
  Copy,
  FileText,
  Filter,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function DashboardPage() {
  useAuthSync();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { searchQuery, filterStatus, setSearchQuery, setFilterStatus } =
    useProjectStore();

  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const archiveProject = useArchiveProject();
  const duplicateProject = useDuplicateProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<bigint | null>(
    null,
  );
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      await createProject.mutateAsync({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      });
      setCreateOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      toast.success("Project created successfully");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async () => {
    if (selectedProjectId === null) return;
    try {
      await deleteProject.mutateAsync(selectedProjectId);
      setDeleteOpen(false);
      setSelectedProjectId(null);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleArchive = async (id: bigint) => {
    try {
      await archiveProject.mutateAsync(id);
      toast.success("Project archived");
    } catch {
      toast.error("Failed to archive project");
    }
  };

  const handleDuplicate = async (id: bigint) => {
    try {
      await duplicateProject.mutateAsync(id);
      toast.success("Project duplicated");
    } catch {
      toast.error("Failed to duplicate project");
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Research Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your research projects and workspaces
            </p>
          </div>
          <GlassButton
            glassVariant="hero"
            onClick={() => setCreateOpen(true)}
            data-ocid="dashboard.create_project_button"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </GlassButton>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border/40 bg-background/50 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-smooth focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              data-ocid="dashboard.search_input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "active", "archived"] as const).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-smooth",
                  filterStatus === status
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-accent/30",
                )}
                data-ocid={`dashboard.filter.${status}_tab`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoadingSpinner size="lg" label="Loading projects..." />
          </div>
        ) : filteredProjects.length === 0 ? (
          <GlassCard className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              No projects found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Create your first research project to get started."}
            </p>
            {!searchQuery && (
              <GlassButton
                variant="default"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
                data-ocid="dashboard.empty_create_button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </GlassButton>
            )}
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="group relative flex flex-col p-5 hover:border-primary/30">
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        project.status === "active"
                          ? "bg-success/20 text-success"
                          : "bg-muted/50 text-muted-foreground",
                      )}
                    >
                      {project.status}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-md p-1 text-muted-foreground opacity-0 transition-smooth hover:bg-accent/50 group-hover:opacity-100"
                          data-ocid={`dashboard.project.${index + 1}.menu_button`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-strong">
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(project.id)}
                          data-ocid={`dashboard.project.${index + 1}.duplicate_button`}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchive(project.id)}
                          data-ocid={`dashboard.project.${index + 1}.archive_button`}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setDeleteOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                          data-ocid={`dashboard.project.${index + 1}.delete_button`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/workspace/${project.id}`)}
                    className="text-left"
                    data-ocid={`dashboard.project.${index + 1}.open_link`}
                  >
                    <h3 className="font-display text-base font-semibold text-foreground transition-smooth group-hover:text-primary">
                      {project.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </button>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-border/30 pt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Docs
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bot className="h-3.5 w-3.5" />
                      Agents
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Start a new research project with a name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Quantum Computing Survey"
                data-ocid="dashboard.create_project.name_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief description of your research focus..."
                rows={3}
                data-ocid="dashboard.create_project.description_input"
              />
            </div>
          </div>
          <DialogFooter>
            <GlassButton
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="dashboard.create_project.cancel_button"
            >
              Cancel
            </GlassButton>
            <GlassButton
              glassVariant="hero"
              onClick={handleCreate}
              disabled={createProject.isPending}
              data-ocid="dashboard.create_project.submit_button"
            >
              {createProject.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <GlassButton
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              data-ocid="dashboard.delete_project.cancel_button"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="default"
              className="bg-destructive/90 hover:bg-destructive text-destructive-foreground"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              data-ocid="dashboard.delete_project.confirm_button"
            >
              {deleteProject.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
