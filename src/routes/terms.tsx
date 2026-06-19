import { createFileRoute } from "@tanstack/react-router";
import { pageHead, ComingSoon } from "@/lib/page-helpers";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms & Conditions", "Terms and conditions for booking with The Pioneer Tours."),
  component: () => <ComingSoon title="Terms & Conditions" blurb="Our terms document is being finalized." />,
});
