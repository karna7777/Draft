"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import FloorPlan from "@/components/FloorPlan";
import House3D from "@/components/House3D";
import { Room, area, ft, openKitchen, biggerMaster, baseModel } from "@/lib/floorplan";
import { Project } from "@/lib/store";
import { getProject, saveProject as apiSave } from "@/lib/api";

type Msg = { who: "u" | "a"; text: string };

const COMMANDS: { label: string; model: () => Room[]; reply: string }[] = [
  { label: "Make the kitchen larger and open it to the living room.", model: openKitchen, reply: "Done — merged the dining space into an open kitchen that flows into the living room." },
  { label: "Give the master bedroom more space.", model: biggerMaster, reply: "Widened the master to 20ʹ (now 400 sq ft) and re-fit Bedroom 2 and the ensuite alongside it." },
  { label: "Reset to the original layout.", model: baseModel, reply: "Reverted the floor to the original generated layout." },
];

function EditorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sel, setSel] = useState<Room | null>(null);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving">("saved");
  const [show3d, setShow3d] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "a", text: "Here's your generated design. Tell me what to change, or drag rooms directly on the canvas." }]);
  const msgsRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the project from the API.
  useEffect(() => {
    if (!id) {
      router.replace("/projects");
      return;
    }
    let active = true;
    getProject(id)
      .then(({ project }) => {
        if (!active) return;
        setProject(project);
        setSel(project.floors[project.activeFloor]?.rooms[0] ?? null);
      })
      .catch((e: Error) => {
        if (!active) return;
        if (/authenticat/i.test(e.message)) router.replace(`/login?next=/editor?id=${id}`);
        else setLoadError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, router]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  const persist = useCallback(
    async (p: Project) => {
      if (!id) return;
      setStatus("saving");
      try {
        const { project: fresh } = await apiSave(id, p);
        // Sync server-assigned floor ids without disturbing the active view.
        setProject((cur) => (cur ? { ...cur, floors: fresh.floors, updatedAt: fresh.updatedAt } : fresh));
        setStatus("saved");
      } catch {
        setStatus("dirty");
      }
    },
    [id]
  );

  // Debounced autosave whenever the project is marked dirty.
  const scheduleSave = useCallback(
    (p: Project) => {
      setStatus("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(p), 1200);
    },
    [persist]
  );

  if (loadError) {
    return (
      <div className="app tone-charcoal" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p className="auth-error" style={{ display: "inline-block" }}>{loadError}</p>
          <p><Link href="/projects" className="app-exit">Back to projects</Link></p>
        </div>
      </div>
    );
  }
  if (!project) return <div className="app tone-charcoal" style={{ minHeight: "100vh" }} />;

  const floor = project.floors[project.activeFloor];

  function update(next: Project, dirty = true) {
    setProject(next);
    if (dirty) scheduleSave(next);
  }
  function setRooms(rooms: Room[], remount = false) {
    const floors = project!.floors.map((f, i) => (i === project!.activeFloor ? { ...f, rooms } : f));
    update({ ...project!, floors });
    if (remount) setVersion((v) => v + 1);
  }
  function switchFloor(i: number) {
    update({ ...project!, activeFloor: i }, false);
    setVersion((v) => v + 1);
    setSel(project!.floors[i].rooms[0] ?? null);
  }
  function runCommand(c: (typeof COMMANDS)[number]) {
    setMsgs((m) => [...m, { who: "u", text: c.label }]);
    setRooms(c.model(), true);
    setSel(null);
    setTimeout(() => setMsgs((m) => [...m, { who: "a", text: c.reply }]), 480);
  }
  function matchCommand(text: string) {
    const t = text.toLowerCase();
    if (t.includes("kitchen") && /larg|open|big|expand/.test(t)) return COMMANDS[0];
    if ((t.includes("master") || t.includes("bedroom")) && /larg|big|more|space|expand/.test(t)) return COMMANDS[1];
    if (/reset|original|revert|undo|start over/.test(t)) return COMMANDS[2];
    return null;
  }
  function submit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { who: "u", text }]);
    const cmd = matchCommand(text);
    if (cmd) {
      setRooms(cmd.model(), true);
      setSel(null);
      setTimeout(() => setMsgs((m) => [...m, { who: "a", text: cmd.reply }]), 480);
    } else {
      setTimeout(
        () =>
          setMsgs((m) => [
            ...m,
            { who: "a", text: "Got it — I've noted that. Full natural-language editing arrives with Draft's design engine; for now try one of the suggestions, or drag rooms directly on the canvas." },
          ]),
        480
      );
    }
  }
  function saveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (project) persist(project);
  }

  const statusLabel = status === "saved" ? "Saved" : status === "saving" ? "Saving…" : "Save";

  return (
    <div className="app editor-app tone-charcoal">
      <header className="app-bar">
        <Link href="/projects" className="brand"><BrandMark />Draft</Link>
        <div className="eb-title">
          <span className="eb-name">{project.name}</span>
          <span className="eb-meta mono">{project.brief.bedrooms} bed · {Math.round(project.brief.plotW)}×{Math.round(project.brief.plotH)} {project.brief.unit} · {project.brief.style}</span>
        </div>
        <div className="eb-actions">
          <span className={`eb-save-status mono ${status}`}>{status === "saved" ? "All changes saved" : status === "saving" ? "Saving…" : "Unsaved changes"}</span>
          <button className="eb-btn" onClick={() => setShow3d(true)}>Preview in 3D</button>
          <button className="eb-btn primary" onClick={saveNow} disabled={status === "saving"}>{statusLabel}</button>
        </div>
      </header>

      <div className="editor-body">
        {/* left rail */}
        <aside className="rail">
          <div className="rail-sec">
            <div className="rail-h mono">FLOORS</div>
            {project.floors.map((f, i) => (
              <button key={f.id} className={`rail-item ${i === project.activeFloor ? "on" : ""}`} onClick={() => switchFloor(i)}>
                <span className="ri-dot" />
                {f.name}
              </button>
            ))}
          </div>
          <div className="rail-sec">
            <div className="rail-h mono">SPACES · {floor.rooms.length}</div>
            <div className="rail-rooms">
              {floor.rooms.map((r) => (
                <button key={r.id} className={`rail-room ${sel?.id === r.id ? "on" : ""}`} onClick={() => setSel(r)}>
                  <span className="rr-swatch" data-type={r.type} />
                  <span className="rr-name">{r.name}</span>
                  <span className="rr-area mono">{area(r)}</span>
                </button>
              ))}
            </div>
          </div>
          {sel && (
            <div className="rail-sec inspector">
              <div className="rail-h mono">SELECTED</div>
              <div className="ins-box">
                <h4>{sel.name}</h4>
                <div className="kv"><span>Width</span><b>{ft(sel.w)}</b></div>
                <div className="kv"><span>Depth</span><b>{ft(sel.h)}</b></div>
                <div className="kv"><span>Area</span><b>{area(sel)} sq ft</b></div>
                <div className="kv"><span>Position</span><b>{Math.round(sel.x)}, {Math.round(sel.y)}</b></div>
              </div>
            </div>
          )}
        </aside>

        {/* canvas */}
        <main className="canvas">
          <div className="canvas-toolbar">
            <span className="ct-tool">◻ Select</span>
            <span className="ct-tool">✥ Move</span>
            <span className="ct-tool">▦ 1ʹ grid</span>
            <span className="ct-plot mono">PLOT · {Math.round(project.plot.w)}ʹ × {Math.round(project.plot.h)}ʹ</span>
          </div>
          <div className="canvas-stage">
            <div className="canvas-plan">
              <FloorPlan
                key={`${floor.id}-${version}`}
                rooms={floor.rooms}
                editable
                selectedId={sel?.id}
                onSelect={setSel}
                onChange={(rooms) => setRooms(rooms)}
              />
            </div>
          </div>
          <p className="canvas-hint mono">Drag any room to reposition it on the grid · click to inspect · changes save automatically</p>
        </main>

        {/* Draft AI */}
        <aside className="ai-panel">
          <div className="ai-head">
            <span className="ai-dot" />
            <span className="ai-title">Draft AI</span>
          </div>
          <div className="ai-msgs" ref={msgsRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`ai-msg ${m.who}`}>
                {m.who === "a" && <div className="ai-who mono">DRAFT</div>}
                {m.text}
              </div>
            ))}
          </div>
          <div className="ai-suggest">
            <div className="ai-sug-h mono">TRY ASKING</div>
            {COMMANDS.map((c) => (
              <button key={c.label} className="ai-sug" onClick={() => runCommand(c)}>{c.label}</button>
            ))}
          </div>
          <div className="ai-input">
            <input
              placeholder="Tell Draft what to change…"
              aria-label="Message Draft AI"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button aria-label="Send" onClick={submit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </aside>
      </div>

      {show3d && (
        <div className="modal3d" onClick={() => setShow3d(false)}>
          <div className="modal3d-inner" onClick={(e) => e.stopPropagation()}>
            <div className="m3-head">
              <span>{project.name} · {floor.name}</span>
              <button onClick={() => setShow3d(false)} aria-label="Close">✕</button>
            </div>
            <House3D rooms={floor.rooms} />
            <p className="m3-cap mono">Auto-rotating massing — hover to pause</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="app tone-charcoal" style={{ minHeight: "100vh" }} />}>
      <EditorInner />
    </Suspense>
  );
}
