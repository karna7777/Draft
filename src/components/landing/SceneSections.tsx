"use client";

const SCENES = [
  { k: "DESCRIBE", t: "Describe it", d: "A sentence becomes a plan that holds together." },
  { k: "EDIT", t: "Edit it", d: "Lift the roof, move a wall — it stays a real drawing." },
  { k: "WALK", t: "Walk into it", d: "The camera travels from the street to standing inside." },
  { k: "STYLE", t: "Style it", d: "Furnish and restyle the room — the space responds live." },
];

export default function SceneSections({ beat }: { beat: number }) {
  return (
    <div className="scenes" aria-hidden="true">
      {SCENES.map((s, i) =>
        /* beat 0 ("Describe") is the hero itself — don't double it up */
        i === 0 ? null : (
          <div key={s.k} className={`scene-cap ${beat === i ? "on" : ""} ${beat > i ? "past" : ""}`}>
            <span className="scene-k mono">0{i + 1} — {s.k}</span>
            <h2 className="scene-t">{s.t}</h2>
            <p className="scene-d">{s.d}</p>
          </div>
        )
      )}
    </div>
  );
}
