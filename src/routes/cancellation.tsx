import { createFileRoute } from "@tanstack/react-router";
import { pageHead, ComingSoon } from "@/lib/page-helpers";

export const Route = createFileRoute("/cancellation")({
  head: () => pageHead("Cancellation Policy", "Cancellation and refund policy for The Pioneer Tours."),
  component: () => <ComingSoon title="Cancellation Policy" blurb="Our cancellation document is being finalized." />,
});
