import Link from "next/link";

export default function Footer() {
  return (
    <footer className="lfoot">
      <div className="lfoot-top">
        <div className="lfoot-brand">
          <span className="lnav-mark" aria-hidden="true" />
          Draft
        </div>
        <nav className="lfoot-cols">
          <div>
            <span className="lfoot-h mono">PRODUCT</span>
            <Link href="/create">Architect</Link>
            <Link href="/editor">Editor</Link>
            <Link href="/projects">Projects</Link>
          </div>
          <div>
            <span className="lfoot-h mono">ACCOUNT</span>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Create account</Link>
          </div>
        </nav>
      </div>
      <div className="lfoot-bottom">
        <p className="mono">Conceptual design for exploration — not construction documents. Review by a licensed professional required before building.</p>
        <span className="mono">© {new Date().getFullYear()} Draft</span>
      </div>
    </footer>
  );
}
