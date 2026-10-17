"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import { me } from "@/lib/api";

const LINKS: [string, string][] = [
  ["#concept", "How it works"],
  ["#editor", "Editor"],
  ["#styles", "Styles"],
  ["#gallery", "Gallery"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    me().then(({ user }) => setAuthed(Boolean(user))).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function go(href: string) {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className={`nav2 ${scrolled ? "scrolled" : ""}`}>
        <div className="nav2-in">
          <a className="nav2-brand" href="#top"><BrandMark />Draft</a>
          <nav className="nav2-links">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={(e) => { e.preventDefault(); go(href); }}>{label}</a>
            ))}
          </nav>
          <div className="nav2-right">
            <Link className="nav2-login" href={authed ? "/projects" : "/login"}>{authed ? "Your projects" : "Log in"}</Link>
            <Link className="btn-solid sm" href={authed ? "/projects" : "/create"}>Start designing</Link>
            <button className="nav2-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nav2-overlay ${open ? "open" : ""}`}>
        <div className="nav2-ovbar">
          <a className="nav2-brand dark" href="#top" onClick={() => setOpen(false)}><BrandMark />Draft</a>
          <button className="nav2-close" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button>
        </div>
        <nav className="nav2-ovlinks">
          {LINKS.map(([href, label], i) => (
            <a key={href} href={href} style={{ transitionDelay: `${0.06 * i + 0.05}s` }} onClick={(e) => { e.preventDefault(); go(href); }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav2-ovfoot">
          <Link className="nav2-login dark" href={authed ? "/projects" : "/login"} onClick={() => setOpen(false)}>{authed ? "Your projects" : "Log in"}</Link>
          <Link className="btn-solid" href={authed ? "/projects" : "/create"} onClick={() => setOpen(false)}>Start designing</Link>
        </div>
      </div>
    </>
  );
}
