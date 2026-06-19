import { useEffect, useState } from "react";
import { Phone, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BRAND, waLink } from "@/lib/brand";

export function FloatingButtons() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop / scrolled floating stack */}
      <motion.div
        initial={false}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20, pointerEvents: show ? "auto" : "none" }}
        className="fixed bottom-5 right-5 z-40 hidden flex-col gap-3 sm:flex"
      >
        <a
          href={waLink(`Hi ${BRAND.name}! I'd love to plan a trip. Can you help?`)}
          target="_blank" rel="noreferrer" aria-label="WhatsApp us"
          className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-[var(--shadow-card)] transition hover:scale-105"
        >
          <MessageCircle className="size-7" />
        </a>
        <a
          href={`tel:${BRAND.phone}`} aria-label="Call us"
          className="grid size-14 place-items-center rounded-full bg-[image:var(--gradient-sky)] text-primary-foreground shadow-[var(--shadow-card)] transition hover:scale-105"
        >
          <Phone className="size-6" />
        </a>
      </motion.div>

      {/* Mobile sticky CTA bar — always visible */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 backdrop-blur sm:hidden">
        <a
          href={`tel:${BRAND.phone}`}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-primary"
          aria-label="Call us"
        >
          <Phone className="size-5" /> Call
        </a>
        <a
          href={waLink(`Hi ${BRAND.name}! I'd love to plan a trip.`)}
          target="_blank" rel="noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 border-x py-2.5 text-xs font-medium text-secondary"
          aria-label="WhatsApp us"
        >
          <MessageCircle className="size-5" /> WhatsApp
        </a>
        <Link
          to="/custom-planner"
          className="flex flex-1 flex-col items-center gap-0.5 bg-[image:var(--gradient-sky)] py-2.5 text-xs font-bold text-primary-foreground"
        >
          <Sparkles className="size-5" /> Plan Trip
        </Link>
      </div>
    </>
  );
}
