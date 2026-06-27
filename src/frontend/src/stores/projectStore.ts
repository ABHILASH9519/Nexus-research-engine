import type { Project, ProjectId, ProjectSummary } from "@/backend";
import { create } from "zustand";

interface ProjectState {
  projects: ProjectSummary[];
  selectedProject: Project | null;
  searchQuery: string;
  filterStatus: "all" | "active" | "archived";
  setProjects: (projects: ProjectSummary[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: "all" | "active" | "archived") => void;
  addProject: (project: ProjectSummary) => void;
  removeProject: (id: ProjectId) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  searchQuery: "",
  filterStatus: "all",
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));
