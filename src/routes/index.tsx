import { createFileRoute } from "@tanstack/react-router";
import { CohortDashboard } from "@/components/cohort/CohortDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cohort Dashboard — Coordination multi-agents" },
      { name: "description", content: "Suivez branches, état partagé, conflits et événements de vos agents IA." },
      { property: "og:title", content: "Cohort Dashboard — Coordination multi-agents" },
      { property: "og:description", content: "Suivez branches, état partagé, conflits et événements de vos agents IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CohortDashboard,
});
