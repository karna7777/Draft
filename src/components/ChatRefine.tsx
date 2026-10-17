"use client";

import { useEffect, useRef, useState } from "react";
import FloorPlan from "./FloorPlan";
import Reveal from "./Reveal";
import { baseModel, biggerMaster, openKitchen, Room } from "@/lib/floorplan";

type Cmd = "open" | "master" | "reset";
interface Msg {
  who: "u" | "a";
  text: string;
}

const COMMANDS: Record<Cmd, { label: string; model: () => Room[]; reply: string }> = {
  open: {
    label: "Make the kitchen larger and open it to the living room.",
    model: openKitchen,
    reply:
      "Done — I merged the dining space into an open kitchen that flows into the living room. Sightlines from the entry are now clear.",
  },
  master: {
    label: "Give the master bedroom more space.",
    model: biggerMaster,
    reply:
      "I widened the master to 20ʹ (now 400 sq ft) and re-fit Bedroom 2 and the ensuite alongside it. The corridor stays continuous.",
  },
  reset: {
    label: "Go back to the original layout.",
    model: baseModel,
    reply: "Reverted to the original Concept A layout.",
  },
};

export default function ChatRefine() {
  const [rooms, setRooms] = useState<Room[]>(baseModel());
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "a", text: "Here's Concept A on your 30 × 50 plot — 3 bedrooms, 1,500 sq ft. What would you like to adjust?" },
  ]);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  function run(cmd: Cmd) {
    const c = COMMANDS[cmd];
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    setMsgs((m) => [...m, { who: "u", text: c.label }]);
    setRooms(c.model());
    window.setTimeout(() => setMsgs((m) => [...m, { who: "a", text: c.reply }]), reduce ? 0 : 520);
  }

  return (
    <section className="wrap section">
      <Reveal>
        <div className="sec-head">
          <span className="num">04 / REFINE</span>
          <h2>Just tell Draft what to change.</h2>
          <p>
            The assistant isn&apos;t a chatbot parked beside your plan — it understands the design and rewrites it. Ask
            in plain language and watch the layout respond.
          </p>
        </div>
      </Reveal>
      <Reveal>
        <div className="chatwrap" style={{ marginTop: 48 }}>
          <div className="chat-stage">
            <FloorPlan rooms={rooms} />
          </div>
          <div className="chat">
            <div className="msgs" ref={msgsRef}>
              {msgs.map((m, i) => (
                <div key={i} className={`msg ${m.who}`}>
                  {m.who === "a" && <div className="who">Draft</div>}
                  {m.text}
                </div>
              ))}
            </div>
            <div className="suggest">
              {(Object.keys(COMMANDS) as Cmd[]).map((k) => (
                <button key={k} className="sugg" onClick={() => run(k)}>
                  {COMMANDS[k].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
