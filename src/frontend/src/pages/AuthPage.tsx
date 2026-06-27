import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore, useAuthSync } from "@/stores/authStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowLeft, FlaskConical, LogIn, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useAuthSync();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isLoading = loginStatus === "logging-in" || isLoggingIn;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="strong" className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
              <FlaskConical className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome to Nexus
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in securely with Internet Identity
            </p>
          </div>

          <div className="space-y-4">
            <GlassButton
              glassVariant="hero"
              size="lg"
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading}
              data-ocid="auth.login_button"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Internet Identity
                </>
              )}
            </GlassButton>

            <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3">
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Your identity is secured by the Internet Computer protocol. No
                passwords required.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center text-sm text-muted-foreground transition-smooth hover:text-foreground"
              data-ocid="auth.back_button"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
