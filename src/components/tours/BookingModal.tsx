import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/routes/tours.index";
import { usePrefill } from "@/hooks/use-prefill";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Invalid email" }),
  phone: z.string().trim().min(8, "Enter a valid phone").max(20),
  message: z.string().trim().max(1000).optional(),
});

export type BookingTour = {
  id: string;
  title: string;
  price: number;
  departure_dates: string[] | null;
};

export function BookingModal({
  open,
  onOpenChange,
  tour,
  travelers,
  departureDate,
  addons,
  total,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tour: BookingTour;
  travelers: number;
  departureDate: string;
  addons: string[];
  total: number;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const prefill = usePrefill();
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || prefill.name,
      email: f.email || prefill.email,
      phone: f.phone || prefill.phone,
    }));
  }, [prefill.name, prefill.email, prefill.phone]);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      tour_id: tour.id,
      tour_title: tour.title,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone,
      travelers,
      departure_date: departureDate || null,
      addons,
      total_amount: total,
      message: parsed.data.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit booking. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Booking request received! We'll confirm shortly.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">Request Received!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our travel team has received your request and will reach out shortly to confirm
              your booking for <strong>{tour.title}</strong>.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Book {tour.title}</DialogTitle>
              <DialogDescription>
                {travelers} traveller{travelers > 1 ? "s" : ""}
                {departureDate ? ` · ${departureDate}` : ""} · Total{" "}
                <strong className="text-primary">{inr(total)}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="b-name">Full name</Label>
                <Input
                  id="b-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="b-email">Email</Label>
                  <Input
                    id="b-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="b-phone">Phone</Label>
                  <Input
                    id="b-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="b-msg">Notes (optional)</Label>
                <Textarea
                  id="b-msg"
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking Request
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
