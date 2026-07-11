// Reusable score display card with a label, big number, and accent color
import React from "react";

// Tailwind can't resolve dynamically-built class names (e.g. `text-${accent}`)
// because its JIT compiler scans for literal strings, so we map to full class names here.
const ACCENT_CLASSES = {
  amber: "text-amber-signal",
  teal: "text-teal-calm",
};

const ScoreCard = ({ label, score, accent = "amber" }) => (
  <div className="bg-studio-panel border border-studio-border rounded-lg p-5 flex flex-col gap-2">
    <span className="text-xs font-mono uppercase tracking-wider text-studio-muted">{label}</span>
    <span className={`text-4xl font-display font-semibold ${ACCENT_CLASSES[accent] || ACCENT_CLASSES.amber}`}>
      {score}<span className="text-lg text-studio-muted">/100</span>
    </span>
  </div>
);

export default ScoreCard;
