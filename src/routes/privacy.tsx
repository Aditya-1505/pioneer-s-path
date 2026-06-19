import { createFileRoute } from "@tanstack/react-router";
import { pageHead, ComingSoon } from "@/lib/page-helpers";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Policy", "How The Pioneer Tours handles your data."),
  component: () => <ComingSoon title="Privacy Policy" blurb="Our privacy document is being finalized." />,
});
