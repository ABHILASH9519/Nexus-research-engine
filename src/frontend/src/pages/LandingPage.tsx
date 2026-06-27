import { GlassButton } from "@/components/GlassButton";
import { GlassCard } from "@/components/GlassCard";
import { useAuthStore } from "@/stores/authStore";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileText,
  FlaskConical,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BrainCircuit,
    title: "Multi-Agent Research",
    description:
      "Orchestrate specialized AI agents for search, analysis, synthesis, and citation.",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description:
      "Upload and index PDFs, DOCX, TXT, and Markdown with keyword search.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track token usage, agent performance, and research trends in real time.",
  },
  {
    icon: Zap,
    title: "Streaming AI Chat",
    description:
      "Conversational memory with progressive token delivery and source citations.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Internet Identity authentication with role-based access control.",
  },
  {
    icon: Sparkles,
    title: "Provider Agnostic",
    description:
      "Configure OpenAI, Gemini, Anthropic, or any OpenAI-compatible endpoint.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(var(--primary)/0.15)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Enterprise Multi-Agent Research Engine
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Nexus{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Research
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            AI-powered research assistant with multi-agent workflows, document
            intelligence, and streaming conversational memory.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <GlassButton
              glassVariant="hero"
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              data-ocid="landing.get_started_button"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </GlassButton>
            <GlassButton
              variant="outline"
              size="lg"
              onClick={() => navigate("/analytics")}
              data-ocid="landing.view_analytics_button"
            >
              View Analytics
            </GlassButton>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-border/40 bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">
              Built for Serious Research
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to conduct AI-assisted research at scale.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full p-6 hover:border-primary/30">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border/40 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Ready to Accelerate Your Research?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sign in with Internet Identity and start building your first
              research project today.
            </p>
            <div className="mt-8">
              <GlassButton
                glassVariant="hero"
                size="lg"
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/auth")
                }
                data-ocid="landing.cta_button"
              >
                {isAuthenticated ? "Open Dashboard" : "Sign In Now"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlassButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
