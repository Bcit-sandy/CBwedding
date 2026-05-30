import { useEffect, useState, useRef } from "react";
import { C } from "../constants";
import PhotoBoothSVG from "./PhotoBoothSVG";

const PNG_FILES = [
  "Rabbit0.png", "Rabbit01.png", "Rabbit02.png", "Rabbit03.png", 
  "Rabbit04.png", "Rabbit05.png", "Rabbit06.png", "Rabbit07.png",
  "Rabbit08.png", "Rabbit09.png", "Rabbit10.png", "Rabbit11.png"
];

/* image placement is handled at runtime to avoid overlaps */

export default function IntroScreen({ onStart }) {
  const [isNarrow, setIsNarrow] = useState(false);
  const containerRef = useRef(null);
  const [randomImages, setRandomImages] = useState([]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 820px)");
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const generate = () => {
      const parent = containerRef.current;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      const placed = [];
      const padding = 12;

      // center content width matches maxWidth from layout (420px) but shrink on small screens
      const contentWidth = Math.min(420, Math.floor(width * 0.7));
      const centerX = Math.floor(width / 2);
      const leftArea = { x1: padding, x2: Math.max(padding + 40, centerX - Math.floor(contentWidth / 2) - padding) };
      const rightArea = { x1: Math.min(width - padding - 40, centerX + Math.floor(contentWidth / 2) + padding), x2: width - padding };

      for (let i = 0; i < PNG_FILES.length; i++) {
        const size = Math.floor(Math.random() * 100) + 100; // 100-200px
        let tries = 0;
        let x, y;
        const side = i % 2 === 0 ? 'left' : 'right';
        const area = side === 'left' ? leftArea : rightArea;

        while (tries < 300) {
          x = Math.floor(Math.random() * (area.x2 - area.x1)) + area.x1;
          y = Math.floor(Math.random() * (height - size - padding)) + size / 2 + padding;
          let ok = true;
          for (const p of placed) {
            const dx = x - p.x;
            const dy = y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (size / 2 + p.size / 2 + padding)) { ok = false; break; }
          }
          if (ok) break;
          tries++;
        }
        // fallback: clamp inside area
        x = Math.max(area.x1 + size / 2, Math.min(x || (area.x1 + area.x2) / 2, area.x2 - size / 2));
        y = Math.max(size / 2 + padding, Math.min(y || height / 2, height - size / 2 - padding));

        placed.push({ file: PNG_FILES[i], x, y, size, rotation: Math.random() * 180 - 90, opacity: Math.random() * 0.25 + 0.55, zIndex: 5 });
      }
      setRandomImages(placed);
    };

    generate();
    const onResize = () => generate();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div className="fade-in" ref={containerRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isNarrow ? '18px 14px' : '24px 20px', background: 'rgba(242,237,228,0.88)', position: 'relative', overflow: 'hidden' }}>
      {randomImages.map((img, idx) => (
        <img
          key={idx}
          src={`/${img.file}`}
          style={{
            position: 'absolute',
            left: `${img.x}px`,
            top: `${img.y}px`,
            width: `${img.size}px`,
            height: `${img.size}px`,
            transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`,
            opacity: img.opacity,
            zIndex: img.zIndex,
            pointerEvents: 'none',
            objectFit: 'cover'
          }}
          alt={`decoration-${idx}`}
        />
      ))}
      <div style={{ textAlign: 'center', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '14px' }}>

          <span style={{ fontSize: '14px', letterSpacing: '0.3em', color: C.muted }}>MAY 30, 2026</span>
          
        </div>

        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: isNarrow ? '2.1rem' : '2.6rem', fontWeight: 500, letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '4px', color: C.text }}>
          Christy &amp; Brian's
        </h1>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: isNarrow ? '2.1rem' : '2.6rem', fontWeight: 500, letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '14px', color: C.text }}>
          Wedding Ceremony
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ height: '1px', width: isNarrow ? '36px' : '50px', background: C.border }} />
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '1rem', letterSpacing: '0.25em', marginTop: '5px', color: C.accent, margin: 0 }}>
            A Celebration of Love
          </p>
          <div style={{ height: '1px', width: isNarrow ? '36px' : '50px', background: C.border }} />
        </div>

        <div className="intro-booth" style={{ margin: '0 auto 5px', display: 'inline-block', filter: 'drop-shadow(0 8px 24px rgba(44,37,32,0.18))' }}>
          <PhotoBoothSVG />
        </div>

        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: '1rem', color: C.secondary, marginBottom: '30px', lineHeight: 1.6 }}>
          Your presence is the greatest gift of all.
        </p>

        <button className="btn-primary" onClick={onStart} style={{ padding: '14px 56px', fontSize: '0.85rem', letterSpacing: '0.25em' }}>
          START
        </button>

        <div style={{ marginTop: '24px', fontSize: '11px', letterSpacing: '0.15em', color: C.muted }}>
          ✦ &nbsp; VANCOUVER &nbsp; ✦
        </div>
      </div>
    </div>
  );
}
