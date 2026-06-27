import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Home,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
];

const adminNavItems = [
  { label: "Admin Settings", icon: Settings, href: "/admin/settings" },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/40 bg-sidebar/80 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/40 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <FlaskConical className="h-5 w-5 text-primary" />
        </div>
        {!isCollapsed && (
          <span className="font-display text-lg font-semibold text-sidebar-foreground">
            Nexus
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                  isActive(item.href)
                    ? "bg-sidebar-primary/20 text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
                data-ocid={`sidebar.nav.${item.label.toLowerCase()}_button`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {isAuthenticated && isAdmin && (
          <>
            {!isCollapsed && (
              <div className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </div>
            )}
            <ul className="mt-2 space-y-1">
              {adminNavItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                      isActive(item.href)
                        ? "bg-sidebar-primary/20 text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    )}
                    data-ocid={`sidebar.nav.${item.label.toLowerCase().replace(/\s+/g, "_")}_button`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border/40 p-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-ocid="sidebar.collapse_button"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
