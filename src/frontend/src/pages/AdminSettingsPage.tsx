import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  useAIConfig,
  useIsAIConfigured,
  useIsCallerAdmin,
  useSetAIConfig,
} from "@/hooks/useQueries";
import { useAuthStore, useAuthSync } from "@/stores/authStore";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Globe,
  Hash,
  Key,
  Settings,
  Shield,
  Thermometer,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  useAuthSync();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: aiConfig, isLoading: configLoading } = useAIConfig();
  const { data: isConfigured } = useIsAIConfigured();
  const setAIConfig = useSetAIConfig();

  const [provider, setProvider] = useState<string>(
    aiConfig?.provider.__kind__ || "openai",
  );
  const [modelId, setModelId] = useState(aiConfig?.modelId || "gpt-4");
  const [apiEndpoint, setApiEndpoint] = useState(aiConfig?.apiEndpoint || "");
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState(aiConfig?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(
    Number(aiConfig?.maxTokens || 2048n),
  );

  // Redirect unauthenticated or non-admin
  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  if (!adminLoading && !isAdmin) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSave = async () => {
    try {
      const providerEnum =
        provider === "openai"
          ? { __kind__: "openai" as const, openai: null }
          : provider === "gemini"
            ? { __kind__: "gemini" as const, gemini: null }
            : provider === "anthropic"
              ? { __kind__: "anthropic" as const, anthropic: null }
              : {
                  __kind__: "custom" as const,
                  custom: provider,
                };

      await setAIConfig.mutateAsync({
        provider: providerEnum,
        modelId,
        apiEndpoint,
        apiKey,
        temperature,
        maxTokens: BigInt(maxTokens),
        updatedAt: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success("AI configuration saved");
    } catch {
      toast.error("Failed to save configuration");
    }
  };

  const isLoading = adminLoading || configLoading;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent/50"
            data-ocid="admin.back_button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure AI providers and system settings
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoadingSpinner size="lg" label="Loading settings..." />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* AI Configuration */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      AI Provider Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select and configure your AI service provider
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Provider */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="provider"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      Provider
                    </Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger
                        id="provider"
                        className="bg-background/50"
                        data-ocid="admin.provider_select"
                      >
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong">
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="custom">
                          Custom / OpenAI-compatible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model ID */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Model ID
                    </Label>
                    <Input
                      id="model"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      placeholder="e.g., gpt-4, claude-3-opus-20240229"
                      className="bg-background/50"
                      data-ocid="admin.model_input"
                    />
                  </div>

                  {/* API Endpoint */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="endpoint"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      API Endpoint
                    </Label>
                    <Input
                      id="endpoint"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="https://api.openai.com/v1/chat/completions"
                      className="bg-background/50"
                      data-ocid="admin.endpoint_input"
                    />
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="apikey" className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      API Key
                    </Label>
                    <Input
                      id="apikey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-background/50"
                      data-ocid="admin.api_key_input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is stored securely in the canister.
                    </p>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="temperature"
                        className="flex items-center gap-2"
                      >
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        Temperature
                      </Label>
                      <span className="text-sm font-medium text-foreground">
                        {temperature.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      id="temperature"
                      value={[temperature]}
                      onValueChange={(v) => setTemperature(v[0])}
                      min={0}
                      max={2}
                      step={0.05}
                      data-ocid="admin.temperature_slider"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxtokens"
                      className="flex items-center gap-2"
                    >
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      Max Tokens
                    </Label>
                    <Input
                      id="maxtokens"
                      type="number"
                      value={maxTokens}
                      onChange={(e) =>
                        setMaxTokens(Number.parseInt(e.target.value) || 2048)
                      }
                      min={256}
                      max={32000}
                      className="bg-background/50"
                      data-ocid="admin.max_tokens_input"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm text-success">
                          AI is configured
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm text-warning">
                          AI not yet configured
                        </span>
                      </>
                    )}
                  </div>
                  <GlassButton
                    glassVariant="hero"
                    onClick={handleSave}
                    disabled={setAIConfig.isPending}
                    data-ocid="admin.save_config_button"
                  >
                    {setAIConfig.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Save Configuration"
                    )}
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>

            {/* Role Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      Access Control
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your role and permissions
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border/30 bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Current Role
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-primary">
                      Administrator
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Permissions
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Configure AI providers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Manage user roles
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        View system analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Access all projects
                      </li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
