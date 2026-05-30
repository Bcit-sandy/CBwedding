import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { C, FRAMES } from "../constants";
import { renderStripPngDataUrl } from "../utils";

export default function ResultScreen({
  photos,
  filterKey,
  stripUrl,
  frameKey,
  onFrameChange,
  onStripUrlChange,
  onNew,
}) {
  const [busy, setBusy] = useState(false);
  const seqRef = useRef(0);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 820px)");
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  const handleSave = () => {
    const a = document.createElement('a');
    a.href = stripUrl;
    a.download = `CBwedding_${Date.now()}.png`;
    a.click();
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!photos?.length) return;
      setBusy(true);
      const seq = ++seqRef.current;
      const url = await renderStripPngDataUrl({ photos, filterKey, frameKey });
      if (!alive || seq !== seqRef.current) return;
      onStripUrlChange?.(url);
      setBusy(false);
    })();
    return () => {
      alive = false;
    };
  }, [photos, filterKey, frameKey, onStripUrlChange]);

  return (
    <div className="fade-in" style={{ height: '100vh', background: 'rgba(242,237,228,0.88)', display: 'flex', flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'center' : 'center', justifyContent: 'center', padding: isNarrow ? '14px 12px' : '24px 40px', boxSizing: 'border-box', overflow: 'hidden', gap: isNarrow ? '16px' : '0' }}>
      {isNarrow && (
        <div style={{ color: C.muted, fontSize: "28px", fontFamily: "'EB Garamond', serif", letterSpacing: "0.12em", textAlign: "center" }}>
          Your Photos Are Ready!
        </div>
      )}
      <div className="strip-reveal" style={{ boxShadow: '0 8px 40px rgba(44,37,32,0.18)', flexShrink: 0 }}>
        <img
          src={stripUrl}
          alt="Photo strip"
          style={{
            display: 'block',
            height: 'auto',
            maxHeight: isNarrow ? '60vh' : '88vh',
            maxWidth: isNarrow ? '72vw' : '100%',
            width: 'auto',
            aspectRatio: '1 / 3',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isNarrow ? '24px' : '40px', marginLeft: isNarrow ? '0' : '120px', alignItems: isNarrow ? 'center' : 'flex-start' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {!isNarrow && (
            <div style={{ color: C.muted, fontSize: "40px", fontFamily: "'EB Garamond', serif" }}>
              Your Photos Are Ready!
            </div>
          )}
          <div style={{ color: C.muted, marginTop: isNarrow ? '0px' : '50px', fontSize: "13px", letterSpacing: "0.2em", fontFamily: "'EB Garamond', serif", textAlign: 'center' }}>
            FRAME COLOR
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: isNarrow ? 'center' : 'flex-start' }}>
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => onFrameChange?.(f.id)}
                disabled={busy}
                type="button"
                aria-label={f.label}
                title={f.label}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: f.paper,
                  border: `2px solid ${f.border}`,
                  padding: 0,
                  boxSizing: "border-box",
                  opacity: busy ? 0.6 : 1,
                  cursor: busy ? "not-allowed" : "pointer",
                  outline: "none",
                  boxShadow:
                    frameKey === f.id
                      ? `0 0 0 3px ${C.pageBg}, 0 0 0 6px ${C.text}`
                      : "none",
                }}
              >
                <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", justifyContent: isNarrow ? 'center' : 'flex-start' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '14px 36px', fontSize: '0.82rem', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={15} /> SAVE
          </button>
          <button className="btn-ghost" onClick={onNew} style={{ padding: '14px 36px', fontSize: '0.82rem', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={15} /> NEW
          </button>
        </div>
      </div>
    </div>
  );
}
