import { useState, useRef, useEffect, useCallback } from "react";
import { Undo2, RotateCw, Download, RefreshCw } from "lucide-react";

const FILTERS = [
  { id: "bw", label: "B&W", css: "brightness(1.2) contrast(1.4) saturate(0)" },
  { id: "natural", label: "Natural", css: "contrast(1.1) brightness(1.05) saturate(1.1)" },
  { id: "cinema", label: "Cinema", css: "saturate(0.4) contrast(1.3) brightness(0.9) sepia(0.2)" },
];

const CANVAS_FILTER = {
  bw: { brightness: 1.2, contrast: 1.4, saturate: 0 },
  natural: { brightness: 1.05, contrast: 1.1, saturate: 1.1 },
  cinema: { brightness: 0.9, contrast: 1.3, saturate: 0.4 },
};

// Noise texture SVG as data URL
const noiseSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)' opacity='1'/></svg>`;
const noiseUrl = `data:image/svg+xml;base64,${btoa(noiseSVG)}`;

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'EB Garamond', serif; background: #F4F4F0; color: #1a1a1a; }

  @keyframes curtainLeft {
    0%, 16%   { transform: translateX(0%); }
    30%, 60%  { transform: translateX(-100%); }
    75%, 90%  { transform: translateX(0%); }
    100%      { transform: translateX(0%); }
  }
  @keyframes curtainRight {
    0%, 15%   { transform: translateX(0%); }
    30%, 60%  { transform: translateX(100%); }
    75%, 90%  { transform: translateX(0%); }
    100%      { transform: translateX(0%); }
  }
  @keyframes boothFlash {
    0%, 29%, 100%   { opacity: 0; }
    32%             { opacity: 0.9; }
    35%             { opacity: 0.1; }
    38%             { opacity: 0.85; }
    42%             { opacity: 0.05; }
    45%             { opacity: 0.8; }
    50%             { opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes countdown {
    from { transform: scale(1.5); opacity: 0; }
    10%  { opacity: 1; transform: scale(1); }
    80%  { opacity: 1; }
    to   { opacity: 0; transform: scale(0.7); }
  }
  @keyframes flashScreen {
    0%   { opacity: 0; }
    10%  { opacity: 1; }
    40%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes stripReveal {
    from { opacity: 0; transform: translateY(20px) rotate(-1deg); }
    to   { opacity: 1; transform: translateY(0) rotate(0deg); }
  }

  .curtain-left  { animation: curtainLeft  5s ease-in-out infinite; }
  .curtain-right { animation: curtainRight 5s ease-in-out infinite; }
  .booth-flash   { animation: boothFlash   5s ease-in-out infinite; }
  .fade-in       { animation: fadeIn 0.8s ease forwards; }
  .spinning      { animation: spin 1s linear infinite; }
  .flash-screen  { animation: flashScreen 0.5s ease forwards; }
  .strip-reveal  { animation: stripReveal 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

  .noise-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background-image: url("${noiseUrl}");
    background-size: 200px 200px;
    opacity: 0.08;
  }

  .btn-primary {
    background: #1a1a1a; color: #F4F4F0;
    border: none; cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.15em;
    transition: all 0.2s;
  }
  .btn-primary:hover { background: #333; transform: translateY(-1px); }

  .btn-ghost {
    background: transparent;
    border: 1px solid #1a1a1a;
    cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.12em;
    transition: all 0.2s;
    color: #1a1a1a;
  }
  .btn-ghost:hover { background: #1a1a1a; color: #F4F4F0; }

  .filter-btn {
    background: transparent;
    border: 1px solid #ccc;
    cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.1em;
    color: #1a1a1a;
    transition: all 0.2s;
    padding: 6px 16px;
    font-size: 13px;
  }
  .filter-btn.active {
    background: #1a1a1a;
    color: #F4F4F0;
    border-color: #1a1a1a;
  }

  .shutter-btn {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: #F4F4F0;
    border: 3px solid #1a1a1a;
    cursor: pointer;
    position: relative;
    transition: transform 0.1s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }
  .shutter-btn:active { transform: scale(0.93); }
  .shutter-btn::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #1a1a1a;
  }
`;

// Retro photo booth SVG illustration
function PhotoBoothSVG() {
  return (
    <svg viewBox="0 0 220 340" width="200" height="310" xmlns="http://www.w3.org/2000/svg" aria-label="Vintage photo booth illustration">
      {/* Booth body */}
      <rect x="20" y="40" width="180" height="280" rx="6" fill="#2a2a2a" />
      <rect x="26" y="46" width="168" height="268" rx="4" fill="#1a1a1a" />

      {/* Roof / top canopy */}
      <rect x="10" y="28" width="200" height="22" rx="4" fill="#8B1a1a" />
      <rect x="16" y="28" width="188" height="4" rx="2" fill="#a82020" />

      {/* Decorative sign */}
      <rect x="35" y="52" width="150" height="32" rx="3" fill="#F4F4F0" />
      <text x="110" y="68" textAnchor="middle" fontSize="9" fontFamily="serif" fill="#1a1a1a" fontWeight="600" letterSpacing="1">MAISON DU</text>
      <text x="110" y="79" textAnchor="middle" fontSize="7.5" fontFamily="serif" fill="#8B1a1a" letterSpacing="2">PHOTOMATON</text>

      {/* Camera lens area */}
      <rect x="40" y="94" width="140" height="100" rx="4" fill="#111" />
      <circle cx="110" cy="144" r="30" fill="#222" />
      <circle cx="110" cy="144" r="24" fill="#0a0a0a" />
      <circle cx="110" cy="144" r="18" fill="#111" />
      <circle cx="110" cy="144" r="12" fill="#1a1a2e" />
      <circle cx="110" cy="144" r="7" fill="#0d0d1a" />
      <circle cx="104" cy="138" r="2.5" fill="#333" opacity="0.8" />
      {/* Flash light */}
      <rect x="148" y="104" width="20" height="14" rx="3" fill="#555" />
      <rect x="150" y="106" width="16" height="10" rx="2" fill="#e8e0c8" />
      {/* Flash glow animation */}
      <rect x="148" y="104" width="20" height="14" rx="3" fill="white" className="booth-flash" />

      {/* Interior curtain area */}
      <rect x="40" y="204" width="140" height="96" rx="4" fill="#3a2010" />

      {/* Curtain left */}
      <g style={{ overflow: 'hidden', clipPath: 'inset(0 50% 0 0)' }}>
        <rect x="40" y="204" width="70" height="96" fill="#8B1a1a" className="curtain-left" style={{ transformOrigin: 'left center' }} />
        {/* Curtain folds */}
        {[0,1,2,3].map(i => (
          <rect key={i} x={40 + i * 17} y="204" width="4" height="96" fill="#7a1515" opacity="0.4" className="curtain-left" style={{ transformOrigin: 'left center' }} />
        ))}
      </g>

      {/* Curtain right */}
      <g style={{ overflow: 'hidden', clipPath: 'inset(0 0 0 50%)' }}>
        <rect x="110" y="204" width="70" height="96" fill="#8B1a1a" className="curtain-right" style={{ transformOrigin: 'right center' }} />
        {[0,1,2,3].map(i => (
          <rect key={i} x={110 + i * 17 + 13} y="204" width="4" height="96" fill="#7a1515" opacity="0.4" className="curtain-right" style={{ transformOrigin: 'right center' }} />
        ))}
      </g>

      {/* Curtain rod */}
      <rect x="38" y="202" width="144" height="5" rx="2" fill="#555" />
      <circle cx="38" cy="204" r="4" fill="#666" />
      <circle cx="182" cy="204" r="4" fill="#666" />

      {/* Side panel: controls */}
      <rect x="26" y="206" width="10" height="60" rx="2" fill="#222" />
      <circle cx="31" cy="220" r="3" fill="#555" />
      <circle cx="31" cy="232" r="3" fill="#333" />
      <rect x="27" y="245" width="8" height="14" rx="1" fill="#444" />

      {/* Coin slot */}
      <rect x="95" y="308" width="30" height="6" rx="1" fill="#333" />
      <rect x="108" y="308" width="4" height="6" rx="1" fill="#222" />

      {/* Footer text */}
      <text x="110" y="326" textAnchor="middle" fontSize="6" fontFamily="serif" fill="#555" letterSpacing="1">INSÉRER MONNAIE</text>

      {/* Decorative stars on canopy */}
      {[-60,-30,0,30,60].map((dx, i) => (
        <text key={i} x={110+dx} y="42" textAnchor="middle" fontSize="7" fill="#F4F4F0" opacity="0.7">✦</text>
      ))}
    </svg>
  );
}

// ─── Screens ───────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#F4F4F0' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        {/* Decorative line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ height: '1px', width: '60px', background: '#1a1a1a' }} />
          <span style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#666' }}>EST. MCMXLVIII</span>
          <div style={{ height: '1px', width: '60px', background: '#1a1a1a' }} />
        </div>

        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '2.6rem', fontWeight: 500, letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '4px' }}>
          Maison du
        </h1>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '2.6rem', fontWeight: 500, letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '6px' }}>
          Photomaton
        </h1>
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '0.9rem', letterSpacing: '0.25em', color: '#8B1a1a', marginBottom: '40px', fontStyle: 'italic' }}>
          Classic Edition
        </p>

        {/* SVG Illustration */}
        <div style={{ margin: '0 auto 40px', display: 'inline-block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}>
          <PhotoBoothSVG />
        </div>

        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '1rem', color: '#555', fontStyle: 'italic', marginBottom: '36px', lineHeight: 1.6 }}>
          Quatre poses. Un souvenir éternel.
        </p>

        <button className="btn-primary" onClick={onStart} style={{ padding: '14px 56px', fontSize: '0.85rem', letterSpacing: '0.25em' }}>
          START
        </button>

        <div style={{ marginTop: '48px', fontSize: '11px', letterSpacing: '0.15em', color: '#aaa' }}>
          ✦ &nbsp; PARIS &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

function ShootingScreen({ onBack, onComplete }) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const [filter, setFilter] = useState("bw");
  const [phase, setPhase] = useState("preview"); // preview | countdown | flash
  const [countdown, setCountdown] = useState(null);
  const [shotCount, setShotCount] = useState(0);
  const capturedRef = useRef([]);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(console.error);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const captureFrame = useCallback((filterKey) => {
    const video = videoRef.current;
    if (!video) return null;
    const c = document.createElement('canvas');
    c.width = 480; c.height = 360;
    const ctx = c.getContext('2d');
    const f = CANVAS_FILTER[filterKey];
    ctx.filter = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate})`;
    // Mirror
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.9);
  }, []);

  const runSession = useCallback(async () => {
    if (phase !== "preview") return;
    capturedRef.current = [];
    for (let i = 0; i < 4; i++) {
      setShotCount(i + 1);
      // Countdown 3..2..1
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        setPhase("countdown");
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      // Flash
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
    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop());
    onComplete(capturedRef.current, filter);
  }, [phase, filter, captureFrame, onComplete]);

  const handleBack = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onBack();
  };

  const filterCSS = FILTERS.find(f => f.id === filter)?.css || "";

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Header */}
      <div style={{ color: '#F4F4F0', fontFamily: "'EB Garamond', serif", letterSpacing: '0.2em', fontSize: '0.75rem', marginBottom: '20px', opacity: 0.6 }}>
        MAISON DU PHOTOMATON — {shotCount > 0 ? `POSE ${shotCount}/4` : 'PRÊT'}
      </div>

      {/* Viewfinder */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', aspectRatio: '4/3', background: '#111', borderRadius: '4px', overflow: 'hidden', border: '2px solid #333' }}>
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: filterCSS, display: 'block' }}
        />
        {/* Corner marks */}
        {['tl','tr','bl','br'].map(c => (
          <div key={c} style={{
            position: 'absolute',
            width: '20px', height: '20px',
            borderTop: c.startsWith('t') ? '2px solid rgba(255,255,255,0.5)' : 'none',
            borderBottom: c.startsWith('b') ? '2px solid rgba(255,255,255,0.5)' : 'none',
            borderLeft: c.endsWith('l') ? '2px solid rgba(255,255,255,0.5)' : 'none',
            borderRight: c.endsWith('r') ? '2px solid rgba(255,255,255,0.5)' : 'none',
            top: c.startsWith('t') ? '10px' : 'auto',
            bottom: c.startsWith('b') ? '10px' : 'auto',
            left: c.endsWith('l') ? '10px' : 'auto',
            right: c.endsWith('r') ? '10px' : 'auto',
          }} />
        ))}
        {/* Countdown */}
        {phase === 'countdown' && countdown && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div key={countdown} className="flash-screen" style={{ fontSize: '8rem', color: '#F4F4F0', fontFamily: "'EB Garamond', serif", fontWeight: 500, lineHeight: 1 }}>
              {countdown}
            </div>
          </div>
        )}
        {/* Flash */}
        {showFlash && (
          <div style={{ position: 'absolute', inset: 0, background: 'white', animation: 'flashScreen 0.5s ease forwards' }} />
        )}
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        {FILTERS.map(f => (
          <button key={f.id} className={`filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: '24px' }}>
        <button onClick={handleBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', transition: 'color 0.2s', padding: '8px' }}
          onMouseEnter={e => e.target.style.color='#F4F4F0'} onMouseLeave={e => e.target.style.color='#666'}>
          <Undo2 size={24} />
        </button>

        <button className="shutter-btn" onClick={runSession} disabled={phase !== 'preview'} style={{ opacity: phase !== 'preview' ? 0.4 : 1, cursor: phase !== 'preview' ? 'not-allowed' : 'pointer' }} />

        <div style={{ width: 40 }} />
      </div>

      <p style={{ color: '#444', fontSize: '11px', letterSpacing: '0.1em', marginTop: '16px', fontFamily: "'EB Garamond', serif" }}>
        4 POSES AUTOMATIQUES
      </p>
    </div>
  );
}

function ProcessingScreen({ photos, filterKey, onDone }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [stripUrl, setStripUrl] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Build strip
      const STRIP_W = 320;
      const PHOTO_W = 280;
      const PHOTO_H = 210;
      const PADDING = 20;
      const HEADER = 80;
      const FOOTER = 60;
      const GAP = 12;
      const STRIP_H = HEADER + (PHOTO_H + GAP) * 4 + FOOTER;

      const canvas = document.createElement('canvas');
      canvas.width = STRIP_W * 2; canvas.height = STRIP_H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      // Background
      ctx.fillStyle = '#FDFCF8';
      ctx.fillRect(0, 0, STRIP_W, STRIP_H);

      // Subtle border
      ctx.strokeStyle = '#e0ddd6';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, STRIP_W - 1, STRIP_H - 1);

      // Header
      ctx.fillStyle = '#1a1a1a';
      ctx.font = "500 11px 'Georgia', serif";
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'center';
      ctx.fillText('MAISON DU PHOTOMATON', STRIP_W / 2, 28);
      ctx.font = "italic 9px 'Georgia', serif";
      ctx.fillStyle = '#8B1a1a';
      ctx.fillText('Classic Edition', STRIP_W / 2, 44);

      // Divider
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(PADDING, 56); ctx.lineTo(STRIP_W - PADDING, 56);
      ctx.stroke();

      // Photos
      const f = CANVAS_FILTER[filterKey];
      const filterStr = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate})`;

      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.src = photos[i];
        await new Promise(r => { img.onload = r; });

        const x = (STRIP_W - PHOTO_W) / 2;
        const y = HEADER + i * (PHOTO_H + GAP);

        // White border + shadow
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 5, y - 5, PHOTO_W + 10, PHOTO_H + 10);
        ctx.shadowBlur = 0;

        // Photo
        ctx.filter = filterStr;
        ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
        ctx.filter = 'none';

        // Black frame
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, PHOTO_W, PHOTO_H);
      }

      // Footer
      const footerY = HEADER + (PHOTO_H + GAP) * 4 + 10;
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(PADDING, footerY); ctx.lineTo(STRIP_W - PADDING, footerY);
      ctx.stroke();

      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      ctx.fillStyle = '#888';
      ctx.font = "10px 'Georgia', serif";
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, STRIP_W / 2, footerY + 22);

      // Small stars
      ctx.fillStyle = '#8B1a1a';
      ctx.font = '8px serif';
      ctx.fillText('✦  PARIS  ✦', STRIP_W / 2, footerY + 40);

      setStripUrl(canvas.toDataURL('image/png'));
      setReady(true);
      onDone(canvas.toDataURL('image/png'));
    }, 1500);
    return () => clearTimeout(timer);
  }, [photos, filterKey, onDone]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F4F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <RotateCw size={32} className="spinning" style={{ color: '#1a1a1a' }} />
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '1.1rem', fontStyle: 'italic', letterSpacing: '0.1em', color: '#555' }}>
          Developing…
        </p>
      </div>
    );
  }

  return null;
}

function ResultScreen({ stripUrl, onNew }) {
  const handleSave = () => {
    const a = document.createElement('a');
    a.href = stripUrl;
    a.download = `CBwedding_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: '#F4F4F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#888', marginBottom: '24px', fontFamily: "'EB Garamond', serif" }}>
          VOS PHOTOS SONT PRÊTES
        </div>

        {/* Photo strip */}
        <div className="strip-reveal" style={{ display: 'inline-block', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', marginBottom: '36px' }}>
          <img src={stripUrl} alt="Photo strip" style={{ display: 'block', maxWidth: '240px', width: '100%' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 32px', fontSize: '0.8rem', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={14} /> SAVE
          </button>
          <button className="btn-ghost" onClick={onNew} style={{ padding: '12px 32px', fontSize: '0.8rem', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} /> NEW
          </button>
        </div>

        <div style={{ marginTop: '40px', fontSize: '10px', letterSpacing: '0.15em', color: '#bbb', fontFamily: "'EB Garamond', serif" }}>
          ✦ &nbsp; MERCI &nbsp; ✦
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | shoot | processing | result
  const [photos, setPhotos] = useState([]);
  const [filterKey, setFilterKey] = useState("bw");
  const [stripUrl, setStripUrl] = useState(null);

  const handleStart = async () => {
    setScreen("shoot");
  };

  const handleComplete = (pics, fk) => {
    setPhotos(pics);
    setFilterKey(fk);
    setScreen("processing");
  };

  const handleStripReady = (url) => {
    setStripUrl(url);
    setScreen("result");
  };

  const handleNew = () => {
    setPhotos([]);
    setStripUrl(null);
    setFilterKey("bw");
    setScreen("intro");
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="noise-overlay" aria-hidden="true" />
      {screen === "intro" && <IntroScreen onStart={handleStart} />}
      {screen === "shoot" && <ShootingScreen onBack={() => setScreen("intro")} onComplete={handleComplete} />}
      {screen === "processing" && <ProcessingScreen photos={photos} filterKey={filterKey} onDone={handleStripReady} />}
      {screen === "result" && stripUrl && <ResultScreen stripUrl={stripUrl} onNew={handleNew} />}
    </>
  );
}
