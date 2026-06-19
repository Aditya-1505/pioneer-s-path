import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20, pointerEvents: show ? "auto" : "none" }}
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3"
    >
      <a
        href={waLink(`Hi ${BRAND.name}! I'd love to plan a trip. Can you help?`)}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp us"
        className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-[var(--shadow-card)] transition hover:scale-105"
      >
        <MessageCircle className="size-7" />
      </a>
      <a
        href={`tel:${BRAND.phone}`}
        aria-label="Call us"
        className="grid size-14 place-items-center rounded-full bg-[image:var(--gradient-sky)] text-primary-foreground shadow-[var(--shadow-card)] transition hover:scale-105"
      >
        <Phone className="size-6" />
      </a>
    </motion.div>
  );
}
