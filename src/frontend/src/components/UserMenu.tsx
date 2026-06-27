import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, Settings, Shield, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { clear } = useInternetIdentity();
  const { isAdmin, principal } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clear();
    setOpen(false);
    navigate("/auth");
  };

  const initials = principal ? principal.slice(0, 2).toUpperCase() : "??";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg p-1.5 transition-smooth hover:bg-accent/50",
            className,
          )}
          data-ocid="user.menu_button"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground md:block">
            {principal ? `${principal.slice(0, 8)}...` : "Guest"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-strong">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {principal ? `${principal.slice(0, 12)}...` : "Guest"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? "Administrator" : "Researcher"}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            navigate("/dashboard");
          }}
          data-ocid="user.profile_link"
        >
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              navigate("/admin/settings");
            }}
            data-ocid="user.admin_settings_link"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            navigate("/analytics");
          }}
          data-ocid="user.analytics_link"
        >
          <Settings className="mr-2 h-4 w-4" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
          data-ocid="user.logout_button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
