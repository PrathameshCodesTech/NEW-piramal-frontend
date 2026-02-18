import { useState } from "react";

/* ────────────────────────────────────────────────────────
   SimplePie — SVG donut chart with CSS-overlay center
   Props:
     size          – px (default 164)
     segments      – [{ value, color, label, ...rest }]
     onSegmentClick – (segment) => void
     innerContent  – ReactNode rendered in the donut hole
────────────────────────────────────────────────────────── */
export default function SimplePie({
  size = 164,
  segments = [],
  onSegmentClick,
  innerContent,
}) {
  const [hovered, setHovered] = useState(null);

  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (total === 0)
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 10;  // outer radius
  const r = R * 0.56;       // inner radius (donut hole)

  let angle = -90; // start from top

  const arcs = segments.map((seg, idx) => {
    const value = seg.value || 0;
    const sweep = (value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + sweep;
    angle = endAngle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1o = cx + R * Math.cos(toRad(startAngle));
    const y1o = cy + R * Math.sin(toRad(startAngle));
    const x2o = cx + R * Math.cos(toRad(endAngle));
    const y2o = cy + R * Math.sin(toRad(endAngle));
    const x1i = cx + r * Math.cos(toRad(endAngle));
    const y1i = cy + r * Math.sin(toRad(endAngle));
    const x2i = cx + r * Math.cos(toRad(startAngle));
    const y2i = cy + r * Math.sin(toRad(startAngle));
    const large = sweep > 180 ? 1 : 0;

    const d = [
      `M ${x1o} ${y1o}`,
      `A ${R} ${R} 0 ${large} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${r} ${r} 0 ${large} 0 ${x2i} ${y2i}`,
      "Z",
    ].join(" ");

    return { d, seg, idx, sweep };
  });

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
        {arcs.map(({ d, seg, idx, sweep }) => {
          if (sweep < 0.5) return null;
          const isHov = hovered === idx;
          return (
            <path
              key={idx}
              d={d}
              fill={seg.color}
              stroke="white"
              strokeWidth={2}
              style={{
                transform: isHov ? `scale(1.04)` : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: "transform 0.15s ease",
                cursor: onSegmentClick ? "pointer" : "default",
                opacity: hovered !== null && !isHov ? 0.75 : 1,
              }}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSegmentClick?.(seg)}
            />
          );
        })}
      </svg>

      {/* Center overlay — absolutely positioned over the donut hole */}
      {innerContent && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {innerContent}
        </div>
      )}
    </div>
  );
}
