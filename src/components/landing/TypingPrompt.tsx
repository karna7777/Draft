"use client";

import { useEffect, useRef, useState } from "react";

/** Shows the (auto-typed) prompt with a caret; click to type your own. */
export default function TypingPrompt({
  value,
  busy,
  onSubmit,
}: {
  value: string;
  busy: boolean;
  onSubmit: (brief: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  function begin() {
    if (busy) return;
    setDraft(value);
    setEditing(true);
  }
  function submit() {
    const v = draft.trim();
    if (!v) return;
    setEditing(false);
    onSubmit(v);
  }

  return (
    <div className="tp">
      <div className="tp-box" onClick={begin}>
        {editing ? (
          <input
            ref={inputRef}
            className="tp-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onBlur={() => setEditing(false)}
            placeholder="Describe your home…"
            aria-label="Describe your home"
          />
        ) : (
          <span className="tp-text">
            {value}
            <span className="tp-caret" />
          </span>
        )}
        <button
          className="tp-go"
          onClick={(e) => { e.stopPropagation(); if (editing) submit(); else begin(); }}
          disabled={busy}
          aria-label="Generate"
        >
          {busy ? <span className="tp-spin" /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          )}
        </button>
      </div>
      <p className="tp-hint mono">Click to type your own — Draft generates a real plan</p>
    </div>
  );
}
