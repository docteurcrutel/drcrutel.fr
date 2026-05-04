// sketch-components.jsx
// Reusable hand-drawn / watercolor components for the dental animation series.
//
// Style system:
//  - Paper background with subtle grain
//  - Pencil strokes drawn live (stroke-dasharray animation)
//  - Watercolor washes that bloom from a center point
//  - Handwritten captions (Caveat / Kalam / Patrick Hand)
//
// Loaded after animations.jsx; uses Stage / Sprite / useTime / Easing from window.

// ── Color palette (watercolor + pencil) ─────────────────────────────────────
const SketchColors = {
  paper:       '#f6efe2',      // warm cream paper
  paperShade:  '#ebe1d0',      // for paper edges
  pencil:      '#2a2520',      // graphite
  pencilLight: '#5a4f44',      // light graphite for hatching
  ink:         '#1a1612',      // ink contour
  // watercolor washes (semi-transparent)
  rose:        'rgba(244, 175, 178, 0.55)',   // gum / soft tissue
  roseStrong:  'rgba(232, 130, 135, 0.65)',
  blue:        'rgba(180, 210, 230, 0.55)',   // tooth highlight, water
  blueStrong:  'rgba(120, 170, 200, 0.65)',
  yellow:      'rgba(244, 223, 166, 0.55)',   // enamel warm
  yellowDeep:  'rgba(220, 180, 110, 0.7)',    // caries
  green:       'rgba(180, 210, 170, 0.5)',
  white:       'rgba(255, 253, 248, 0.85)',
  red:         'rgba(210, 90, 75, 0.65)',     // bleeding / inflammation
  gold:        'rgba(200, 160, 90, 0.7)',     // accent
};

// ── Paper background with grain ─────────────────────────────────────────────
function PaperBg({ children, vignette = true }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: SketchColors.paper,
      overflow: 'hidden',
    }}>
      {/* Subtle grain via SVG noise */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, mixBlendMode: 'multiply' }}>
        <filter id="paperNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.15 0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#paperNoise)"/>
      </svg>
      {/* Paper fold/horizontal subtle lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        <defs>
          <pattern id="paperLines" width="100%" height="34" patternUnits="userSpaceOnUse">
            <line x1="0" y1="33" x2="100%" y2="33" stroke="#5a4f44" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paperLines)"/>
      </svg>

      {children}

      {vignette && (
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 200px rgba(80, 60, 40, 0.18)',
        }}/>
      )}
    </div>
  );
}

// ── DrawnPath: an SVG path that "draws itself" over a duration ──────────────
// Pass `progress` (0..1). The path appears as if traced by a pencil.
// If `pathLength` is unknown, set ref and we measure on mount.
function DrawnPath({
  d,
  progress = 1,
  stroke = SketchColors.pencil,
  strokeWidth = 1.6,
  fill = 'none',
  pathLength,
  opacity = 1,
  jitter = false,
  filter,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
}) {
  const ref = React.useRef(null);
  const [len, setLen] = React.useState(pathLength || 1000);

  React.useEffect(() => {
    if (ref.current && !pathLength) {
      try {
        const l = ref.current.getTotalLength();
        if (l > 0) setLen(l);
      } catch {}
    }
  }, [d, pathLength]);

  const drawn = clamp(progress, 0, 1) * len;
  const remaining = len - drawn;

  return (
    <path
      ref={ref}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill={fill}
      opacity={opacity}
      filter={filter}
      style={{
        strokeDasharray: `${drawn} ${remaining}`,
        strokeDashoffset: 0,
      }}
    />
  );
}

// ── PencilFilter: sloppy pencil look (slightly rough edges) ─────────────────
function SketchDefs() {
  return (
    <defs>
      <filter id="pencilRough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="2" seed="5" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2"/>
      </filter>
      <filter id="pencilRoughHeavy" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5"/>
      </filter>
      <filter id="watercolorBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="3"/>
      </filter>
      <filter id="watercolorEdge" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="2" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="6"/>
        <feGaussianBlur stdDeviation="0.8"/>
      </filter>
      {/* radial gradient for watercolor pool */}
      <radialGradient id="wcRose">
        <stop offset="0%" stopColor="rgba(244, 175, 178, 0.0)"/>
        <stop offset="40%" stopColor="rgba(244, 175, 178, 0.35)"/>
        <stop offset="80%" stopColor="rgba(232, 130, 135, 0.55)"/>
        <stop offset="100%" stopColor="rgba(232, 130, 135, 0.2)"/>
      </radialGradient>
      <radialGradient id="wcBlue">
        <stop offset="0%" stopColor="rgba(180, 210, 230, 0.0)"/>
        <stop offset="40%" stopColor="rgba(180, 210, 230, 0.35)"/>
        <stop offset="80%" stopColor="rgba(120, 170, 200, 0.55)"/>
        <stop offset="100%" stopColor="rgba(120, 170, 200, 0.2)"/>
      </radialGradient>
      <radialGradient id="wcYellow">
        <stop offset="0%" stopColor="rgba(244, 223, 166, 0.0)"/>
        <stop offset="40%" stopColor="rgba(244, 223, 166, 0.45)"/>
        <stop offset="80%" stopColor="rgba(220, 180, 110, 0.6)"/>
        <stop offset="100%" stopColor="rgba(220, 180, 110, 0.2)"/>
      </radialGradient>
    </defs>
  );
}

// ── WatercolorBlob: an organic shape that blooms from 0 -> full ─────────────
function WatercolorBlob({
  cx, cy, r,
  fill = 'url(#wcRose)',
  progress = 1,
  seed = 1,
  opacity = 1,
}) {
  // Generate an organic blob path centered at cx,cy with avg radius r.
  // 8 control points on a circle, jittered by seed.
  const pts = React.useMemo(() => {
    const n = 9;
    const arr = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const jitter = 0.78 + 0.4 * pseudoRand(seed + i * 1.31);
      arr.push({
        x: cx + Math.cos(a) * r * jitter,
        y: cy + Math.sin(a) * r * jitter,
      });
    }
    return arr;
  }, [cx, cy, r, seed]);

  const d = React.useMemo(() => smoothClosedPath(pts), [pts]);

  const t = clamp(progress, 0, 1);
  // Bloom effect: scale up + opacity
  const scale = 0.3 + 0.7 * Easing.easeOutCubic(t);
  const o = opacity * Easing.easeOutQuad(clamp(t * 1.4, 0, 1));

  return (
    <g
      style={{
        transformBox: 'fill-box',
        transformOrigin: `${cx}px ${cy}px`,
        transform: `scale(${scale})`,
        opacity: o,
      }}
    >
      <path d={d} fill={fill} filter="url(#watercolorEdge)"/>
    </g>
  );
}

function pseudoRand(s) {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function smoothClosedPath(pts) {
  if (!pts.length) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    const p2 = pts[(i + 2) % pts.length];
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x} ${p1.y} ${cx} ${cy}`;
  }
  d += ' Z';
  return d;
}

// ── HandwrittenLabel: text in handwriting font with optional underline ──────
function HandwrittenLabel({
  text,
  x, y,
  size = 32,
  color = SketchColors.pencil,
  font = "'Caveat', cursive",
  weight = 500,
  align = 'left',
  rotate = 0,
  progress = 1,
  underline = false,
  maxWidth,
}) {
  const t = clamp(progress, 0, 1);
  // Reveal letter-by-letter
  const len = text.length;
  const reveal = Math.floor(t * len);
  const partial = text.slice(0, reveal);
  const cursorVisible = t < 1 && t > 0;

  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${tx}, 0) rotate(${rotate}deg)`,
      transformOrigin: align === 'center' ? 'center' : 'left',
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.0,
      letterSpacing: '0.005em',
      maxWidth,
      whiteSpace: maxWidth ? 'normal' : 'pre',
    }}>
      {partial}
      {cursorVisible && <span style={{ opacity: 0.5 }}>|</span>}
      {underline && t > 0.6 && (
        <div style={{
          height: 2,
          background: color,
          marginTop: 4,
          width: `${clamp((t - 0.6) / 0.4, 0, 1) * 100}%`,
          borderRadius: 2,
          opacity: 0.7,
        }}/>
      )}
    </div>
  );
}

// ── ArrowSketch: a curvy hand-drawn arrow that draws itself ─────────────────
function ArrowSketch({
  from, to,
  curvature = 30,
  progress = 1,
  color = SketchColors.pencil,
  strokeWidth = 1.8,
  arrowSize = 10,
}) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  // perpendicular offset for curvature
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ctrl = { x: mid.x + nx * curvature, y: mid.y + ny * curvature };

  const d = `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`;

  // Arrow head (drawn after main line)
  const ang = Math.atan2(to.y - ctrl.y, to.x - ctrl.x);
  const a1x = to.x - Math.cos(ang - 0.45) * arrowSize;
  const a1y = to.y - Math.sin(ang - 0.45) * arrowSize;
  const a2x = to.x - Math.cos(ang + 0.45) * arrowSize;
  const a2y = to.y - Math.sin(ang + 0.45) * arrowSize;

  const lineProg = clamp(progress / 0.8, 0, 1);
  const headProg = clamp((progress - 0.8) / 0.2, 0, 1);

  return (
    <g>
      <DrawnPath d={d} progress={lineProg} stroke={color} strokeWidth={strokeWidth}/>
      {headProg > 0 && (
        <g opacity={headProg}>
          <line x1={to.x} y1={to.y} x2={a1x} y2={a1y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
          <line x1={to.x} y1={to.y} x2={a2x} y2={a2y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
        </g>
      )}
    </g>
  );
}

// ── ToothAnatomy: a realistic incisor/molar drawn with pencil + watercolor ──
// type: 'incisor' | 'molar' | 'molarBroken'
// Renders crown + roots + gum line + pulp chamber. Coordinates are local to
// the SVG group; pass cx, cy as the apex point of the crown.
//
// drawProgress: 0..1 — how much of the contour is drawn.
// washProgress: 0..1 — how much watercolor wash is applied.
function ToothMolar({
  cx = 0, cy = 0,
  scale = 1,
  drawProgress = 1,
  washProgress = 1,
  showPulp = false,
  showGum = true,
  showBone = false,
  cariesProgress = 0,    // 0..1 yellow/brown cavity on top
  cariesPos = 'top',     // 'top' | 'side'
  filling = null,        // 'composite' | 'onlay' | null
  fillingProgress = 0,
  whiteningProgress = 0, // 0..1: brightens enamel
  rotate = 0,
}) {
  // Anatomy paths (local coords, design centred at (0,0), tooth ~140 wide x 220 tall)
  const crownPath = "M -50 -110 Q -65 -100 -68 -70 Q -72 -40 -65 -10 L -55 0 L 55 0 Q 70 -40 65 -75 Q 60 -100 50 -110 Q 30 -118 0 -116 Q -28 -118 -50 -110 Z";
  // Cusps on the chewing surface
  const cuspsPath = "M -45 -95 Q -38 -80 -28 -90 Q -15 -100 0 -88 Q 18 -100 30 -90 Q 42 -80 48 -95";
  // Roots (two for molar)
  const root1 = "M -42 0 Q -50 50 -45 90 Q -38 105 -28 102 Q -18 95 -18 70 Q -22 30 -25 0";
  const root2 = "M 25 0 Q 18 30 22 70 Q 22 95 32 102 Q 42 105 48 90 Q 53 50 45 0";
  // Pulp chamber
  const pulpPath = "M -25 -85 Q -28 -60 -22 -30 L 22 -30 Q 28 -60 25 -85 Q 18 -90 0 -90 Q -18 -90 -25 -85 Z M 0 -28 L 0 90";
  // Gum line
  const gumPath = "M -90 0 Q -60 -8 -45 -2 L 45 -2 Q 60 -8 90 0 L 90 25 Q 0 32 -90 25 Z";
  // Bone shading (simplified)
  const bonePath = "M -90 25 Q 0 40 90 25 L 90 110 Q 0 130 -90 110 Z";

  const enamelTint = whiteningProgress > 0
    ? `rgba(255, 252, 240, ${0.5 + 0.4 * whiteningProgress})`
    : `rgba(248, 232, 200, 0.4)`;

  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) rotate(${rotate})`}>
      {/* BONE wash (deepest layer) */}
      {showBone && washProgress > 0.2 && (
        <g opacity={clamp((washProgress - 0.2) / 0.5, 0, 1)}>
          <path d={bonePath} fill="rgba(230, 215, 180, 0.5)" filter="url(#watercolorEdge)"/>
        </g>
      )}

      {/* GUM wash */}
      {showGum && washProgress > 0.1 && (
        <g opacity={clamp((washProgress - 0.1) / 0.4, 0, 1)}>
          <path d={gumPath} fill="rgba(244, 175, 178, 0.6)" filter="url(#watercolorEdge)"/>
        </g>
      )}

      {/* ENAMEL wash */}
      {washProgress > 0.05 && (
        <g opacity={clamp(washProgress / 0.5, 0, 1)}>
          <path d={crownPath} fill={enamelTint} filter="url(#watercolorEdge)"/>
          <path d={`${root1} ${root2}`} fill="rgba(240, 215, 175, 0.45)" filter="url(#watercolorEdge)"/>
        </g>
      )}

      {/* CARIES (brown spot) */}
      {cariesProgress > 0 && !filling && (
        <g opacity={cariesProgress}>
          {cariesPos === 'top' ? (
            <ellipse cx="-5" cy="-92" rx={14 + 4 * cariesProgress} ry={10 + 3 * cariesProgress}
                     fill="rgba(120, 70, 40, 0.7)" filter="url(#watercolorEdge)"/>
          ) : (
            <ellipse cx="-55" cy="-50" rx="12" ry="18"
                     fill="rgba(120, 70, 40, 0.7)" filter="url(#watercolorEdge)"/>
          )}
        </g>
      )}

      {/* FILLING / ONLAY */}
      {filling && fillingProgress > 0 && (
        <g opacity={fillingProgress}>
          {filling === 'composite' && (
            <path d="M -22 -100 Q -10 -108 5 -105 Q 22 -100 18 -88 Q 10 -82 -8 -85 Q -22 -88 -22 -100 Z"
                  fill="rgba(255, 248, 230, 0.95)" stroke={SketchColors.pencil} strokeWidth="0.8"/>
          )}
          {filling === 'onlay' && (
            <g>
              <path d="M -42 -100 Q -45 -82 -32 -75 L 32 -75 Q 45 -82 42 -100 Q 30 -108 0 -108 Q -30 -108 -42 -100 Z"
                    fill="rgba(220, 215, 200, 0.95)" stroke={SketchColors.pencil} strokeWidth="1"/>
              <path d="M -38 -95 Q -28 -85 -15 -88 Q 0 -92 15 -88 Q 28 -85 38 -95"
                    stroke={SketchColors.pencilLight} strokeWidth="0.6" fill="none" opacity="0.6"/>
            </g>
          )}
        </g>
      )}

      {/* PENCIL CONTOUR (drawn last on top) */}
      <g filter="url(#pencilRough)">
        <DrawnPath d={crownPath} progress={drawProgress} strokeWidth={1.6}/>
        <DrawnPath d={cuspsPath} progress={Math.max(0, (drawProgress - 0.3) / 0.7)} strokeWidth={1.2} stroke={SketchColors.pencilLight}/>
        <DrawnPath d={root1} progress={Math.max(0, (drawProgress - 0.4) / 0.6)} strokeWidth={1.4}/>
        <DrawnPath d={root2} progress={Math.max(0, (drawProgress - 0.5) / 0.5)} strokeWidth={1.4}/>
        {showGum && (
          <DrawnPath d={gumPath} progress={Math.max(0, (drawProgress - 0.6) / 0.4)} strokeWidth={1.2} stroke={SketchColors.pencilLight}/>
        )}
        {showPulp && (
          <DrawnPath d={pulpPath} progress={Math.max(0, (drawProgress - 0.7) / 0.3)} strokeWidth={1} stroke={SketchColors.pencilLight} fill="none"/>
        )}
      </g>

      {/* Subtle hatching shadows for depth */}
      {drawProgress > 0.85 && (
        <g opacity="0.25" filter="url(#pencilRough)">
          <path d="M -55 -50 L -45 -30 M -55 -30 L -45 -10 M 50 -50 L 60 -30 M 50 -30 L 60 -10"
                stroke={SketchColors.pencilLight} strokeWidth="0.6" fill="none"/>
        </g>
      )}
    </g>
  );
}

// ── ToothIncisor: front tooth (for whitening, veneers, etc.) ────────────────
function ToothIncisor({
  cx = 0, cy = 0,
  scale = 1,
  drawProgress = 1,
  washProgress = 1,
  showPulp = false,
  showGum = true,
  whiteningProgress = 0,
  veneer = false,
  veneerProgress = 0,
  rotate = 0,
}) {
  // Slimmer crown, single root
  const crownPath = "M -32 -130 Q -42 -110 -40 -70 Q -38 -30 -32 0 L 32 0 Q 38 -30 40 -70 Q 42 -110 32 -130 Q 18 -138 0 -136 Q -18 -138 -32 -130 Z";
  const rootPath = "M -28 0 Q -32 60 -22 110 Q -10 130 0 128 Q 10 130 22 110 Q 32 60 28 0";
  const pulpPath = "M -14 -100 Q -16 -60 -10 -20 L 10 -20 Q 16 -60 14 -100 Z M 0 -18 L 0 110";
  const gumPath = "M -80 0 Q -45 -8 -32 -2 L 32 -2 Q 45 -8 80 0 L 80 22 Q 0 30 -80 22 Z";
  const edgePath = "M -28 -2 Q -14 4 0 2 Q 14 4 28 -2";

  const enamelTint = whiteningProgress > 0
    ? `rgba(255, 253, 245, ${0.55 + 0.4 * whiteningProgress})`
    : `rgba(248, 232, 200, 0.4)`;

  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) rotate(${rotate})`}>
      {/* GUM */}
      {showGum && washProgress > 0.1 && (
        <g opacity={clamp((washProgress - 0.1) / 0.4, 0, 1)}>
          <path d={gumPath} fill="rgba(244, 175, 178, 0.6)" filter="url(#watercolorEdge)"/>
        </g>
      )}
      {/* ENAMEL */}
      {washProgress > 0.05 && (
        <g opacity={clamp(washProgress / 0.5, 0, 1)}>
          <path d={crownPath} fill={enamelTint} filter="url(#watercolorEdge)"/>
          <path d={rootPath} fill="rgba(240, 215, 175, 0.45)" filter="url(#watercolorEdge)"/>
        </g>
      )}

      {/* VENEER overlay */}
      {veneer && veneerProgress > 0 && (
        <g opacity={veneerProgress}>
          <path d="M -30 -128 Q -38 -108 -36 -68 Q -34 -32 -28 -8 L 28 -8 Q 34 -32 36 -68 Q 38 -108 30 -128 Q 16 -134 0 -132 Q -16 -134 -30 -128 Z"
                fill="rgba(255, 255, 252, 0.85)"
                stroke={SketchColors.pencilLight} strokeWidth="0.8"/>
          <path d="M -22 -118 Q -26 -100 -18 -85 Q -8 -75 0 -78"
                stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" opacity="0.7"/>
        </g>
      )}

      {/* PENCIL CONTOUR */}
      <g filter="url(#pencilRough)">
        <DrawnPath d={crownPath} progress={drawProgress} strokeWidth={1.6}/>
        <DrawnPath d={edgePath} progress={Math.max(0, (drawProgress - 0.3) / 0.7)} strokeWidth={1} stroke={SketchColors.pencilLight}/>
        <DrawnPath d={rootPath} progress={Math.max(0, (drawProgress - 0.45) / 0.55)} strokeWidth={1.4}/>
        {showGum && (
          <DrawnPath d={gumPath} progress={Math.max(0, (drawProgress - 0.6) / 0.4)} strokeWidth={1.2} stroke={SketchColors.pencilLight}/>
        )}
        {showPulp && (
          <DrawnPath d={pulpPath} progress={Math.max(0, (drawProgress - 0.7) / 0.3)} strokeWidth={1} stroke={SketchColors.pencilLight} fill="none"/>
        )}
      </g>
    </g>
  );
}

// ── ComicPanel: a numbered panel with a hand-drawn frame ────────────────────
function ComicPanel({
  x, y, w, h,
  number,
  title,
  drawProgress = 1,
  children,
}) {
  // Slightly imperfect rectangle path
  const r = 4;
  const wob = 2.5;
  const path = `M ${wob} 0 L ${w - wob} ${-1} Q ${w} 0 ${w - 1} ${wob}
                L ${w} ${h - wob} Q ${w} ${h} ${w - wob} ${h - 1}
                L ${wob} ${h} Q 0 ${h} ${1} ${h - wob}
                L 0 ${wob} Q 0 0 ${wob} ${1} Z`;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <SketchDefs/>
        <g filter="url(#pencilRough)">
          <DrawnPath d={path} progress={drawProgress} strokeWidth={2.2} stroke={SketchColors.pencil}/>
        </g>
        {number != null && drawProgress > 0.5 && (
          <g opacity={clamp((drawProgress - 0.5) / 0.5, 0, 1)}>
            <circle cx="22" cy="22" r="16" fill={SketchColors.paper} stroke={SketchColors.pencil} strokeWidth="1.5"/>
            <text x="22" y="29" textAnchor="middle"
                  style={{ font: "600 22px 'Caveat', cursive", fill: SketchColors.pencil }}>
              {number}
            </text>
          </g>
        )}
      </svg>
      {title && drawProgress > 0.7 && (
        <div style={{
          position: 'absolute', top: -28, left: 50,
          fontFamily: "'Caveat', cursive",
          fontSize: 26,
          color: SketchColors.pencil,
          opacity: clamp((drawProgress - 0.7) / 0.3, 0, 1),
        }}>
          {title}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 8 }}>
        {children}
      </div>
    </div>
  );
}

// ── Signature/branding (Dr. Crutel) ─────────────────────────────────────────
function Signature({ progress = 1, x = 1700, y = 1010 }) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      fontFamily: "'Caveat', cursive",
      fontSize: 28,
      color: SketchColors.pencil,
      opacity: clamp(progress, 0, 1),
      transform: 'rotate(-3deg)',
    }}>
      <div style={{ fontSize: 18, opacity: 0.7, lineHeight: 1 }}>Dr.</div>
      <div style={{ fontSize: 36, fontWeight: 600, lineHeight: 0.9, marginTop: 2 }}>Crutel</div>
      <div style={{
        height: 2, width: 90, marginTop: 4,
        background: SketchColors.pencil,
        borderRadius: 2, opacity: 0.6,
      }}/>
    </div>
  );
}

// ── PageHeader: title at top of page in ledger style ────────────────────────
function PageHeader({ title, subtitle, progress = 1, num }) {
  return (
    <div style={{
      position: 'absolute',
      left: 80, top: 50,
      fontFamily: "'Caveat', cursive",
      color: SketchColors.pencil,
      opacity: clamp(progress, 0, 1),
    }}>
      {num != null && (
        <div style={{ fontSize: 28, opacity: 0.5, fontWeight: 400 }}>
          N° {num} / 7
        </div>
      )}
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, marginTop: 4, whiteSpace: 'nowrap' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 26, opacity: 0.55, marginTop: 8, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
          {subtitle}
        </div>
      )}
      <svg width="280" height="14" style={{ marginTop: 8 }}>
        <path d="M 2 7 Q 70 2 140 7 T 278 7"
              stroke={SketchColors.pencil} strokeWidth="2" fill="none" strokeLinecap="round"
              opacity="0.7"/>
      </svg>
    </div>
  );
}

// ── ProgressTimestamp: small data-screen-label updater for comments ─────────
function TimestampLabel() {
  const time = useTime();
  const sec = Math.floor(time);
  React.useEffect(() => {
    const root = document.querySelector('[data-anim-root]');
    if (root) root.setAttribute('data-screen-label', `t=${sec}s`);
  }, [sec]);
  return null;
}

Object.assign(window, {
  SketchColors,
  PaperBg,
  DrawnPath,
  SketchDefs,
  WatercolorBlob,
  HandwrittenLabel,
  ArrowSketch,
  ToothMolar,
  ToothIncisor,
  ComicPanel,
  Signature,
  PageHeader,
  TimestampLabel,
  pseudoRand,
  smoothClosedPath,
});
