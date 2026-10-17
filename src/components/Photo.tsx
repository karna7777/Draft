"use client";

import { useEffect, useRef, useState } from "react";

/** A real photo layered over a generated architectural render.
 *  If the image fails to load (offline / blocked), it removes itself and the
 *  render underneath shows through — so the page is never broken. */
export default function Photo({ src, alt = "", eager = false }: { src: string; alt?: string; eager?: boolean }) {
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached/eager images can finish loading before React attaches onLoad — catch that.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setOk(false);
    }
  }, []);

  if (!ok) return null;
  return (
    <img
      ref={ref}
      className={`photo-over ${loaded ? "in" : ""}`}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onLoad={() => setLoaded(true)}
      onError={() => setOk(false)}
    />
  );
}
