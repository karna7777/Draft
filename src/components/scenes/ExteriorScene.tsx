import { CSSProperties } from "react";

export type ExtVariant = "dusk" | "day" | "warm" | "night";

const PALETTES: Record<ExtVariant, Record<string, string>> = {
  dusk: {
    "--sky1": "#f6cf95", "--sky2": "#d0906a", "--sky3": "#5c4a5e", "--glow": "#ffe6b4",
    "--ground1": "#3b332b", "--ground2": "#201c17", "--wallc": "#ded6c8",
    "--glass1": "#f7d59a", "--glass2": "#caa06f", "--lit": "#ffd98c",
    "--foliage1": "#7e8c6f", "--foliage2": "#48533c",
  },
  day: {
    "--sky1": "#a7c6e6", "--sky2": "#cfe0ee", "--sky3": "#eef3f6", "--glow": "#ffffff",
    "--ground1": "#8a9179", "--ground2": "#5f664f", "--wallc": "#efece5",
    "--glass1": "#cfe2f2", "--glass2": "#9fb9d4", "--lit": "#fbf4dd",
    "--foliage1": "#7f9a63", "--foliage2": "#4d6238",
  },
  warm: {
    "--sky1": "#ecd6b2", "--sky2": "#d8b184", "--sky3": "#b07f57", "--glow": "#ffeccb",
    "--ground1": "#5a4a33", "--ground2": "#312619", "--wallc": "#c9a77e",
    "--glass1": "#f0d8ad", "--glass2": "#c39b6d", "--lit": "#ffdf9f",
    "--foliage1": "#8a8f5f", "--foliage2": "#535737",
  },
  night: {
    "--sky1": "#1a2740", "--sky2": "#111c33", "--sky3": "#080f22", "--glow": "#33507f",
    "--ground1": "#171a20", "--ground2": "#0b0d12", "--wallc": "#2d323b",
    "--glass1": "#3a5b7f", "--glass2": "#22344f", "--lit": "#ffcf7d",
    "--foliage1": "#38452f", "--foliage2": "#1e2618",
  },
};

export default function ExteriorScene({ variant = "dusk", src }: { variant?: ExtVariant; src?: string }) {
  if (src) return <img src={src} alt="" loading="lazy" />;
  return (
    <div className="exs" style={PALETTES[variant] as CSSProperties} aria-hidden="true">
      <div className="sky" />
      <div className="sun" />
      <div className="ground" />
      <div className="house">
        <div className="glass" />
        <div className="win" />
      </div>
      <div className="path" />
      <div className="tree" />
    </div>
  );
}
