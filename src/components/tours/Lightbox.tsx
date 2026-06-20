import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, images.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index - 1 + images.length) % images.length);
            }}
            className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </button>
          <motion.img
            key={index}
            src={images[index]}
            alt=""
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
            {index + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
