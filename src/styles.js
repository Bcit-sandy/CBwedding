import { C } from "./constants";

const noiseSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)' opacity='1'/></svg>`;
const noiseUrl = `data:image/svg+xml;base64,${btoa(noiseSVG)}`;

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'EB Garamond', serif; background: ${C.pageBg}; color: ${C.text}; }

  @keyframes curtainLeft {
    0%, 15%   { transform: translateX(0%); }
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

  .intro-booth { max-width: 92vw; }
  .intro-booth svg { width: 100%; height: auto; display: block; }

  .noise-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background-image: url("${noiseUrl}");
    background-size: 200px 200px;
    opacity: 0.06;
  }

  .btn-primary {
    background: ${C.text}; color: ${C.paper};
    border: none; cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.15em;
    transition: all 0.2s;
  }
  .btn-primary:hover { background: ${C.secondary}; transform: translateY(-1px); }

  .btn-ghost {
    background: transparent;
    border: 1px solid ${C.text};
    cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.12em;
    transition: all 0.2s;
    color: ${C.text};
  }
  .btn-ghost:hover { background: ${C.text}; color: ${C.paper}; }

  .filter-btn {
    background: transparent;
    border: 1px solid ${C.shootMuted};
    cursor: pointer;
    font-family: 'EB Garamond', serif;
    letter-spacing: 0.1em;
    color: ${C.shootMuted};
    transition: all 0.2s;
    padding: 6px 16px;
    font-size: 13px;
  }
  .filter-btn.active {
    background: ${C.paper};
    color: ${C.text};
    border-color: ${C.paper};
  }

  .shutter-btn {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: ${C.paper};
    border: 3px solid ${C.border};
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
    background: ${C.text};
  }
`;
