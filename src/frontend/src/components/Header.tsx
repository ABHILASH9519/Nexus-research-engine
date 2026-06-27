import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { FlaskConical, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "./GlassButton";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuToggle, sidebarCollapsed }: HeaderProps) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-card/80 px-4 backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "left-16 right-0" : "left-64 right-0",
      )}
    >
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-accent/50 lg:hidden"
        aria-label="Toggle menu"
        data-ocid="header.menu_toggle_button"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo (mobile only) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <FlaskConical className="h-4 w-4 text-primary" />
        </div>
        <span className="font-display text-base font-semibold">Nexus</span>
      </div>

      {/* Search Bar */}
      <div className="relative mx-4 hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            "h-9 w-full rounded-lg border bg-background/50 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-smooth focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30",
            searchFocused
              ? "border-primary/40 bg-background/80"
              : "border-border/40",
          )}
          data-ocid="header.search_input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <GlassButton
            variant="default"
            size="sm"
            onClick={() => navigate("/auth")}
            data-ocid="header.login_button"
          >
            Sign In
          </GlassButton>
        )}
      </div>
    </header>
  );
}
