// Color tokens — all text/bg pairs verified WCAG AAA (7:1+)
export const C = {
  pageBg:     "#E5DCD0",  // warm beige        L=0.724
  paper:      "#F2EDE4",  // cream card/paper   L=0.851
  border:     "#C8BFB0",  // warm border
  text:       "#2C2520",  // deep warm brown    11.2:1 on pageBg, 13.1:1 on paper
  secondary:  "#4A3F35",  // medium warm brown   7.5:1 on pageBg,  8.8:1 on paper
  muted:      "#4D4236",  // soft warm brown     7.2:1 on pageBg
  accent:     "#5E3628",  // burgundy/terracotta 7.6:1 on pageBg,  8.8:1 on paper
  shootBg:    "#1A1510",  // warm dark bg
  shootText:  "#F2EDE4",  // cream on dark      16.1:1 on shootBg
  shootMuted: "#B5AA9E",  // warm light grey     8.3:1 on shootBg
};

export const FILTERS = [
  { id: "natural", label: "Natural",  css: "contrast(1.1) brightness(1.05) saturate(1.1)" },
  { id: "bw",      label: "B&W",      css: "brightness(1.2) contrast(1.4) saturate(0)" },
  { id: "warm",    label: "Warm",     css: "sepia(0.25) brightness(1.1) contrast(1.05) saturate(1.15)" },
  { id: "cinema",  label: "Cinema",   css: "saturate(0.4) contrast(1.3) brightness(0.9) sepia(0.2)" },
  { id: "fade",    label: "Fade",     css: "brightness(1.15) contrast(0.85) saturate(0.6)" },
  { id: "vivid",   label: "Vivid",    css: "saturate(1.6) contrast(1.12) brightness(1.05)" },
  { id: "cool",    label: "Cool",     css: "saturate(0.9) brightness(1.05) contrast(1.1) hue-rotate(15deg)" },
];

export const CANVAS_FILTER = {
  natural: { brightness: 1.05, contrast: 1.1,  saturate: 1.1  },
  bw:      { brightness: 1.2,  contrast: 1.4,  saturate: 0    },
  warm:    { brightness: 1.1,  contrast: 1.05, saturate: 1.15, sepia: 0.25 },
  cinema:  { brightness: 0.9,  contrast: 1.3,  saturate: 0.4,  sepia: 0.2 },
  fade:    { brightness: 1.15, contrast: 0.85, saturate: 0.6  },
  vivid:   { brightness: 1.05, contrast: 1.12, saturate: 1.6  },
  cool:    { brightness: 1.05, contrast: 1.1,  saturate: 0.9  },
};

// Frame style options for the printed strip
export const FRAMES = [
  {
    id: "classic",
    label: "Classic",
    paper: C.paper,
    border: C.border,
  },
  {
    id: "champagne",
    label: "Champagne",
    paper: "#F1E7D7",
    border: "#D2BD93",
  },
  {
    id: "powder-blue",
    label: "Powder Blue",
    paper: "#E6EBEF",
    border: "#9AAEC0",
  },
  {
    id: "dusk-blue",
    label: "Dusk Blue",
    paper: "#D8E0E8",
    border: "#6F869A",
  },
  {
    id: "mocha",
    label: "Mocha",
    paper: "#E3D6C7",
    border: "#A88A6B",
  },
];
