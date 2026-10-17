"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import {
  deleteProject,
  duplicateProject,
  listProjects,
  logout,
  me,
  patchProject,
  ProjectSummary,
  SessionUser,
} from "@/lib/api";

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [{ user }, { projects }] = await Promise.all([me(), listProjects()]);
      if (!user) {
        router.push("/login?next=/projects");
        return;
      }
      setUser(user);
      setProjects(projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your projects");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDuplicate(id: string) {
    setBusyId(id);
    try {
      await duplicateProject(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not duplicate");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This removes its floor plans and designs and cannot be undone.`)) return;
    setBusyId(id);
    try {
      await deleteProject(id);
      setProjects((ps) => (ps ?? []).filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  async function onRename(id: string, current: string) {
    const name = prompt("Rename project", current);
    if (!name || name.trim() === current) return;
    setBusyId(id);
    try {
      await patchProject(id, { name: name.trim() });
      setProjects((ps) => (ps ?? []).map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rename");
    } finally {
      setBusyId(null);
    }
  }

  async function onLogout() {
    await logout().catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="app tone-charcoal pj-app">
      <header className="app-bar">
        <Link href="/" className="brand"><BrandMark />Draft</Link>
        <span className="app-step mono">YOUR PROJECTS</span>
        <div className="pj-bar-right">
          {user && <span className="pj-user mono">{user.name || user.email}</span>}
          <button className="app-exit" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="pj-main">
        <div className="pj-head">
          <div>
            <p className="eyebrow accent">Home studio</p>
            <h1 className="pj-h">Your projects</h1>
            <p className="pj-sub">Every home you&apos;re designing — plans, rooms and budgets, saved as you go.</p>
          </div>
          <Link href="/create" className="pj-new">+ New project</Link>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {projects === null && !error && <p className="pj-loading mono">Loading…</p>}

        {projects && projects.length === 0 && (
          <div className="pj-empty">
            <h2>No projects yet</h2>
            <p>Start by describing the home you want to design.</p>
            <Link href="/create" className="pj-new">Create your first project</Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <ul className="pj-grid">
            {projects.map((p) => (
              <li key={p.id} className={`pj-card ${busyId === p.id ? "busy" : ""}`}>
                <Link href={`/editor?id=${p.id}`} className="pj-card-main">
                  <div className="pj-card-top mono">{p.style}</div>
                  <h3>{p.name}</h3>
                  <div className="pj-meta mono">
                    {p.bedrooms} bed · {p.bathrooms} bath · {Math.round(p.plotW)}×{Math.round(p.plotH)} {p.unit}
                  </div>
                  <div className="pj-meta2 mono">
                    {p.floorCount} floor{p.floorCount > 1 ? "s" : ""} · {p.roomCount} rooms · updated {fmtDate(p.updatedAt)}
                  </div>
                </Link>
                <div className="pj-card-actions">
                  <button onClick={() => onRename(p.id, p.name)} disabled={busyId === p.id}>Rename</button>
                  <button onClick={() => onDuplicate(p.id)} disabled={busyId === p.id}>Duplicate</button>
                  <button className="danger" onClick={() => onDelete(p.id, p.name)} disabled={busyId === p.id}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
