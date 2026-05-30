import { useState, useRef, useEffect, useCallback } from "react";
import { Undo2 } from "lucide-react";
import { C, FILTERS } from "../constants";
import { canvasFilterStr } from "../utils";

export default function ShootingScreen({ onBack, onComplete }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturedRef = useRef([]);
  const [filter, setFilter] = useState("natural");
  const [phase, setPhase] = useState("preview");
  const [countdown, setCountdown] = useState(null);
  const [shotCount, setShotCount] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 820px)");
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user',
        },
      })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(console.error);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const captureFrame = useCallback((filterKey) => {
    const video = videoRef.current;
    if (!video) return null;
    const c = document.createElement('canvas');
    c.width = 480; c.height = 360;
    const ctx = c.getContext('2d');
    ctx.filter = canvasFilterStr(filterKey);
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);

    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    if (vw && vh) {
      const targetAspect = c.width / c.height; // 4:3
      const videoAspect = vw / vh;
      let sx, sy, sw, sh;
      if (videoAspect > targetAspect) {
        // Video is wider than 4:3 – crop left/right
        sh = vh;
        sw = vh * targetAspect;
        sx = (vw - sw) / 2;
        sy = 0;
      } else {
        // Video is taller than 4:3 – crop top/bottom
        sw = vw;
        sh = vw / targetAspect;
        sx = 0;
        sy = (vh - sh) / 2;
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
    } else {
      // Fallback if dimensions aren't ready yet
      ctx.drawImage(video, 0, 0, c.width, c.height);
    }

    return c.toDataURL('image/jpeg', 0.9);
  }, []);

  const runSession = useCallback(async () => {
    if (phase !== "preview") return;
    capturedRef.current = [];
    for (let i = 0; i < 4; i++) {
      setShotCount(i + 1);
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        setPhase("countdown");
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      setShowFlash(true);
      setPhase("flash");
      await new Promise(r => setTimeout(r, 80));
      const dataUrl = captureFrame(filter);
      if (dataUrl) capturedRef.current.push(dataUrl);
      await new Promise(r => setTimeout(r, 420));
      setShowFlash(false);
      setPhase(i < 3 ? "preview" : "done");
      await new Promise(r => setTimeout(r, 600));
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    onComplete(capturedRef.current, filter);
  }, [phase, filter, captureFrame, onComplete]);

  const handleBack = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onBack();
  };

  const filterCSS = FILTERS.find(f => f.id === filter)?.css || "";

  return (
    <div style={{ height: '100vh', background: C.shootBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ color: C.shootMuted, fontFamily: "'EB Garamond', serif", letterSpacing: '0.24em', fontSize: '0.76rem', marginBottom: '10px' }}>
        {shotCount > 0 ? `PHOTO ${shotCount} OF 4` : 'PHOTO TAKING IN PROGRESS ...'}
      </div>

      <div style={{ position: 'relative', height: isNarrow ? 'clamp(260px, calc(100vh - 240px), 460px)' : 'clamp(320px, calc(100vh - 225px), 620px)', maxWidth: '94vw', aspectRatio: '4/3', background: '#111', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${C.border}` }}>
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: filterCSS, display: 'block' }}
        />
        {['tl','tr','bl','br'].map(c => (
          <div key={c} style={{
            position: 'absolute',
            width: isNarrow ? '22px' : '28px', height: isNarrow ? '22px' : '28px',
            borderTop: c.startsWith('t') ? `2px solid rgba(242,237,228,0.5)` : 'none',
            borderBottom: c.startsWith('b') ? `2px solid rgba(242,237,228,0.5)` : 'none',
            borderLeft: c.endsWith('l') ? `2px solid rgba(242,237,228,0.5)` : 'none',
            borderRight: c.endsWith('r') ? `2px solid rgba(242,237,228,0.5)` : 'none',
            top: c.startsWith('t') ? (isNarrow ? '10px' : '14px') : 'auto',
            bottom: c.startsWith('b') ? (isNarrow ? '10px' : '14px') : 'auto',
            left: c.endsWith('l') ? (isNarrow ? '10px' : '14px') : 'auto',
            right: c.endsWith('r') ? (isNarrow ? '10px' : '14px') : 'auto',
          }} />
        ))}
        {phase === 'countdown' && countdown && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,21,16,0.4)' }}>
            <div key={countdown} className="flash-screen" style={{ fontSize: isNarrow ? '7.5rem' : '9rem', color: C.shootText, fontFamily: "'EB Garamond', serif", fontWeight: 500, lineHeight: 1 }}>
              {countdown}
            </div>
          </div>
        )}
        {showFlash && (
          <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'flashScreen 0.5s ease forwards' }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {FILTERS.map(f => (
          <button key={f.id} className={`filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isNarrow ? '22px' : '40px', marginTop: '10px' }}>
        <button onClick={handleBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.shootMuted, transition: 'color 0.2s', padding: '8px' }}
          onMouseEnter={e => e.target.style.color=C.shootText} onMouseLeave={e => e.target.style.color=C.shootMuted}>
          <Undo2 size={28} />
        </button>

        <button className="shutter-btn" onClick={runSession} disabled={phase !== 'preview'} style={{ opacity: phase !== 'preview' ? 0.4 : 1, cursor: phase !== 'preview' ? 'not-allowed' : 'pointer' }} />

        <div style={{ width: 40 }} />
      </div>

      <p style={{ color: C.shootMuted, fontSize: isNarrow ? '9px' : '10px', letterSpacing: '0.14em', marginTop: '10px', fontFamily: "'EB Garamond', serif" }}>
        4 PHOTOS · AUTO CAPTURE
      </p>
    </div>
  );
}
