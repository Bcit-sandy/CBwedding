import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import { C } from "../constants";
import { renderStripPngDataUrl } from "../utils";

export default function ProcessingScreen({ photos, filterKey, frameKey = "classic", onDone }) {
  const [ready, setReady] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 820px)");
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const url = await renderStripPngDataUrl({ photos, filterKey, frameKey });
      setReady(true);
      onDone(url);
    }, 1500);
    return () => clearTimeout(timer);
  }, [photos, filterKey, frameKey, onDone]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgba(242,237,228,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isNarrow ? '16px' : '20px' }}>
        <RotateCw size={32} className="spinning" style={{ color: C.text }} />
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: isNarrow ? '1rem' : '1.1rem', fontStyle: 'italic', letterSpacing: '0.1em', color: C.secondary }}>
          Developing…
        </p>
      </div>
    );
  }

  return null;
}
