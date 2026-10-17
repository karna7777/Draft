// Client-side API wrapper. Thin fetch helpers that return parsed JSON and
// throw a friendly Error (message from the server) on non-2xx responses.
"use client";

import type { Brief, Project } from "./store";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  style: string;
  bedrooms: number;
  bathrooms: number;
  plotW: number;
  plotH: number;
  unit: string;
  budget: number | null;
  location: string | null;
  floorCount: number;
  roomCount: number;
  createdAt: number;
  updatedAt: number;
}

// ---- auth ----
export const register = (body: { email: string; password: string; name?: string }) =>
  req<{ user: SessionUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) });

export const login = (body: { email: string; password: string }) =>
  req<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) });

export const logout = () => req<{ ok: true }>("/api/auth/logout", { method: "POST" });

export const me = () => req<{ user: SessionUser | null }>("/api/auth/me");

// ---- projects ----
export const listProjects = () => req<{ projects: ProjectSummary[] }>("/api/projects");

export const createProject = (body: { prompt: string; brief: Brief; name?: string }) =>
  req<{ project: Project }>("/api/projects", { method: "POST", body: JSON.stringify(body) });

export const getProject = (id: string) => req<{ project: Project }>(`/api/projects/${id}`);

export const saveProject = (id: string, project: Project) =>
  req<{ project: Project }>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: project.name,
      prompt: project.prompt,
      brief: project.brief,
      activeFloor: project.activeFloor,
      floors: project.floors,
    }),
  });

export const patchProject = (id: string, patch: Partial<{ name: string; budget: number | null; location: string | null; notes: string | null }>) =>
  req<{ project: Project }>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(patch) });

export const duplicateProject = (id: string) =>
  req<{ project: Project }>(`/api/projects/${id}/duplicate`, { method: "POST" });

export const deleteProject = (id: string) =>
  req<{ ok: true }>(`/api/projects/${id}`, { method: "DELETE" });
