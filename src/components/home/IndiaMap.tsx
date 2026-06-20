import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, ZoomIn, ZoomOut, RotateCcw, X, Sparkles, Users, Clock } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

type Destination = {
  id: string;
  name: string;
  region: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  description: string | null;
  tour_id: string | null;
  tour_slug: string | null;
};

type Tour = {
  id: string;
  slug: string;
  title: string;
  destination: string | null;
  price: number | null;
  duration: string | null;
  seats_available: number | null;
};

// India bounding box for projecting lat/lng into the stylized 100x120 viewBox
const LNG_MIN = 68, LNG_MAX = 97, LAT_MIN = 8, LAT_MAX = 37;
const project = (lat: number, lng: number) => ({
  x: ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
  y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 120,
});

export function IndiaMap() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [active, setActive] = useState<Destination | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    supabase
      .from("map_destinations")
      .select("id,name,region,latitude,longitude,image_url,description,tour_id,tour_slug")
      .eq("is_visible", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => setDestinations((data as Destination[]) ?? []));
    supabase
      .from("tours")
      .select("id,slug,title,destination,price,duration,seats_available")
      .eq("status", "published")
      .then(({ data }) => setTours((data as Tour[]) ?? []));
  }, []);

  const tourFor = (d: Destination) =>
    tours.find((t) =>
      (d.tour_id && t.id === d.tour_id) ||
      (d.tour_slug && t.slug === d.tour_slug) ||
      (t.destination ?? "").toLowerCase().includes(d.name.toLowerCase()),
    );

  const onWheel = (e: React.WheelEvent) => {
    setZoom((z) => Math.max(1, Math.min(3, z + (e.deltaY < 0 ? 0.15 : -0.15))));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  };
  const endDrag = () => { dragRef.current = null; };
  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleView = (d: Destination) => {
    const t = tourFor(d);
    if (t) navigate({ to: "/tours/$slug", params: { slug: t.slug } });
    else navigate({ to: "/tours" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-10 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-secondary">Explore the Map</span>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Tap a Destination on India</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Zoom, pan and click any glowing pin to see live trip details.
        </p>
      </Reveal>

      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <div className="relative">
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="grid size-9 place-items-center rounded-full border bg-card shadow hover:bg-accent" aria-label="Zoom in"><ZoomIn className="size-4" /></button>
              <button onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="grid size-9 place-items-center rounded-full border bg-card shadow hover:bg-accent" aria-label="Zoom out"><ZoomOut className="size-4" /></button>
              <button onClick={reset} className="grid size-9 place-items-center rounded-full border bg-card shadow hover:bg-accent" aria-label="Reset"><RotateCcw className="size-4" /></button>
            </div>

            <div
              className="relative aspect-[5/6] w-full cursor-grab overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 to-emerald-50 active:cursor-grabbing dark:from-slate-900 dark:to-slate-800"
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              <div
                className="absolute inset-0 origin-center transition-transform duration-150"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              >
                <svg viewBox="0 0 100 120" className="size-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="indFill" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="color-mix(in oklab, var(--primary) 30%, transparent)" />
                      <stop offset="100%" stopColor="color-mix(in oklab, var(--secondary) 22%, transparent)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M40 6 L52 8 L58 14 L52 22 L60 26 L62 34 L72 36 L80 44 L74 50 L72 58 L66 64 L64 72 L58 78 L54 86 L52 96 L46 108 L42 116 L36 108 L34 96 L30 86 L26 76 L22 66 L24 56 L20 48 L24 38 L30 30 L28 22 L34 14 Z"
                    fill="url(#indFill)"
                    stroke="color-mix(in oklab, var(--primary) 55%, transparent)"
                    strokeWidth="0.4"
                    strokeLinejoin="round"
                  />
                  {destinations.map((d) => {
                    const { x, y } = project(d.latitude, d.longitude);
                    const has = !!tourFor(d);
                    return (
                      <g key={d.id} transform={`translate(${x} ${y})`}>
                        <circle r="3" className={has ? "fill-primary/30" : "fill-secondary/30"}>
                          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle
                          r="1.6"
                          className={`${has ? "fill-primary" : "fill-secondary"} cursor-pointer drop-shadow`}
                          onClick={(e) => { e.stopPropagation(); setActive(d); }}
                        />
                        <text x="2.5" y="0.8" className="fill-foreground text-[2.2px] font-semibold" pointerEvents="none">
                          {d.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-md rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur"
                  >
                    {(() => {
                      const t = tourFor(active);
                      return (
                        <>
                          <div className="flex items-start gap-3">
                            {active.image_url ? (
                              <img src={active.image_url} alt={active.name} className="size-12 rounded-lg object-cover" />
                            ) : (
                              <span className="text-3xl">📍</span>
                            )}
                            <div className="flex-1">
                              <h3 className="font-display text-lg font-bold">{active.name}</h3>
                              <p className="text-xs text-muted-foreground">{active.description ?? active.region}</p>
                            </div>
                            <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                              <X className="size-4" />
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg bg-muted p-2">
                              <Sparkles className="mx-auto size-3.5 text-primary" />
                              <p className="mt-1 font-semibold">{t?.price ? `₹${t.price.toLocaleString("en-IN")}` : "On request"}</p>
                              <p className="text-[10px] text-muted-foreground">starting</p>
                            </div>
                            <div className="rounded-lg bg-muted p-2">
                              <Clock className="mx-auto size-3.5 text-primary" />
                              <p className="mt-1 font-semibold">{t?.duration ?? "Flexible"}</p>
                              <p className="text-[10px] text-muted-foreground">duration</p>
                            </div>
                            <div className="rounded-lg bg-muted p-2">
                              <Users className="mx-auto size-3.5 text-primary" />
                              <p className="mt-1 font-semibold">{t?.seats_available ?? "—"}</p>
                              <p className="text-[10px] text-muted-foreground">seats</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleView(active)}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
                          >
                            {t ? "View Trip" : "Enquire Now"} <ArrowRight className="size-4" />
                          </button>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {destinations.map((d) => {
              const has = !!tourFor(d);
              return (
                <motion.button
                  key={d.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setActive(d)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                    active?.id === d.id ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                >
                  <span>
                    <span className="font-display text-lg font-semibold">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">{has ? "Packages available" : "Enquire now"}</span>
                  </span>
                  <ArrowRight className="size-4 text-primary" />
                </motion.button>
              );
            })}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" /> Tip: scroll to zoom, drag to pan, click a pin for details.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
