export default function Elevation({ bg = "#f4f0e8", ink = "#22201a" }: { bg?: string; ink?: string }) {
  return (
    <div className="elev" style={{ ["--elev-bg" as string]: bg } as React.CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet" fill="none" stroke={ink}>
        {/* ground line */}
        <line x1="12" y1="242" x2="388" y2="242" strokeWidth="1.5" />
        {/* main volume */}
        <rect x="60" y="120" width="180" height="122" strokeWidth="2" />
        {/* upper cantilever */}
        <rect x="150" y="70" width="190" height="66" strokeWidth="2" />
        {/* roof caps */}
        <line x1="150" y1="70" x2="340" y2="70" strokeWidth="2.5" />
        {/* large ground-floor glazing */}
        <rect x="76" y="150" width="86" height="80" strokeWidth="1" />
        <line x1="105" y1="150" x2="105" y2="230" strokeWidth="1" />
        <line x1="134" y1="150" x2="134" y2="230" strokeWidth="1" />
        {/* door */}
        <rect x="182" y="176" width="34" height="66" strokeWidth="1.4" />
        {/* upper windows */}
        <rect x="172" y="86" width="44" height="34" strokeWidth="1" />
        <rect x="232" y="86" width="44" height="34" strokeWidth="1" />
        <rect x="292" y="86" width="34" height="34" strokeWidth="1" />
        {/* facade battens */}
        {[70, 90, 110, 130].map((y) => (
          <line key={y} x1="240" y1={y + 20} x2="340" y2={y + 20} strokeWidth="0.6" opacity="0.5" />
        ))}
        {/* dimension line */}
        <g strokeWidth="0.8" opacity="0.7">
          <line x1="60" y1="258" x2="240" y2="258" />
          <line x1="60" y1="253" x2="60" y2="263" />
          <line x1="240" y1="253" x2="240" y2="263" />
        </g>
        <text x="150" y="272" fill={ink} stroke="none" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">
          9.0 m
        </text>
      </svg>
    </div>
  );
}
