"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { me } from "@/lib/api";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    me().then(({ user }) => setAuthed(Boolean(user))).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lnav ${scrolled ? "scrolled" : ""}`}>
      <Link href="/" className="lnav-brand">
        <span className="lnav-mark" aria-hidden="true" />
        Draft
      </Link>
      <nav className="lnav-links">
        <a href="#film">The film</a>
        <Link href="/create">Architect</Link>
        <Link href="/projects">Projects</Link>
      </nav>
      <div className="lnav-right">
        <Link className="lnav-ghost" href={authed ? "/projects" : "/login"}>{authed ? "Your projects" : "Sign in"}</Link>
        <Link className="lnav-cta" href={authed ? "/projects" : "/create"}>Begin</Link>
      </div>
    </header>
  );
}
