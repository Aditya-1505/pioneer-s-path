import { useCallback, useRef, useState } from "react";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type BucketName = "tours" | "gallery" | "properties" | "blogs" | "testimonials";

interface BaseProps {
  bucket: BucketName;
  className?: string;
  accept?: string;
  label?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value?: string | null;
  onChange: (url: string | null) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value?: string[] | null;
  onChange: (urls: string[]) => void;
}

type Props = SingleProps | MultiProps;

async function uploadOne(bucket: BucketName, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safe = file.name.replace(/[^a-z0-9.\-_]+/gi, "-").slice(0, 60);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}.${ext}`.replace(/\.\w+\.\w+$/, `.${ext}`);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function ImageUploader(props: Props) {
  const { bucket, className, accept = "image/*", label } = props;
  const multiple = (props as MultiProps).multiple === true;
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSingle = !multiple ? ((props as SingleProps).value ?? null) : null;
  const currentMulti = multiple ? ((props as MultiProps).value ?? []) : [];

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      setBusy(true);
      try {
        if (multiple) {
          const urls: string[] = [];
          for (const f of list) urls.push(await uploadOne(bucket, f));
          (props as MultiProps).onChange([...(currentMulti ?? []), ...urls]);
          toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
        } else {
          const url = await uploadOne(bucket, list[0]);
          (props as SingleProps).onChange(url);
          toast.success("Image uploaded");
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Upload failed");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [bucket, multiple, currentMulti, props],
  );

  const removeSingle = () => (props as SingleProps).onChange(null);
  const removeAt = (i: number) => {
    const next = currentMulti.filter((_, idx) => idx !== i);
    (props as MultiProps).onChange(next);
  };

  return (
    <div className={className}>
      {label && <div className="mb-1.5 text-sm font-medium">{label}</div>}

      {/* Single preview */}
      {!multiple && currentSingle ? (
        <div className="relative inline-block">
          <img src={currentSingle} alt="" className="h-32 w-48 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={removeSingle}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Multi previews */}
      {multiple && currentMulti.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {currentMulti.map((u, i) => (
            <div key={u + i} className="relative">
              <img src={u} alt="" className="h-20 w-20 rounded-lg border object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop / select area */}
      {(multiple || !currentSingle) && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors",
            drag ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent/50",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : multiple ? <ImagePlus className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          <span className="font-medium">
            {busy ? "Uploading…" : multiple ? "Drop images or click to add" : "Drop an image or click to upload"}
          </span>
          <span className="text-xs">Saved to Supabase Storage · {bucket}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}
