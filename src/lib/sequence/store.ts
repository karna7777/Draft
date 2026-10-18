"use client";

// React-facing scene state (infrequent updates): the current plan, the AI
// status narration, the typed prompt, play state, budget, demo-mode flag.
import { create } from "zustand";
import { defaultPlan, type PlanData } from "@/lib/plan";

export type Source = "ai" | "mock";

interface SceneState {
  plan: PlanData;
  status: string;        // "AI thinking" narration line
  source: Source;
  demoMode: boolean;     // no GROQ key → mock
  typed: string;         // text shown in the prompt (typed out)
  editing: boolean;
  playing: boolean;
  selectedRoom: string | null;
  budget: number;

  setPlan: (p: PlanData, source?: Source) => void;
  setStatus: (s: string) => void;
  setTyped: (s: string) => void;
  setEditing: (b: boolean) => void;
  setPlaying: (b: boolean) => void;
  setDemoMode: (b: boolean) => void;
  selectRoom: (id: string | null) => void;
  setBudget: (n: number) => void;
}

export const useScene = create<SceneState>((set) => ({
  plan: defaultPlan(),
  status: "",
  source: "mock",
  demoMode: false,
  typed: "",
  editing: false,
  playing: false,
  selectedRoom: null,
  budget: 0,

  setPlan: (p, source) => set((s) => ({ plan: p, source: source ?? s.source })),
  setStatus: (status) => set({ status }),
  setTyped: (typed) => set({ typed }),
  setEditing: (editing) => set({ editing }),
  setPlaying: (playing) => set({ playing }),
  setDemoMode: (demoMode) => set({ demoMode }),
  selectRoom: (selectedRoom) => set({ selectedRoom }),
  setBudget: (budget) => set({ budget }),
}));
