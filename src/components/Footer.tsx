import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ft tone-charcoal">
      <div className="wrap ft-in">
        <div className="ft-cta">
          <p className="eyebrow accent">Start drafting</p>
          <h2 className="ft-word">Draft</h2>
          <Link className="btn-solid" href="/create">Start designing</Link>
        </div>

        <div className="ft-cols">
          <div>
            <h5>Product</h5>
            <a href="#concept">How it works</a>
            <Link href="/editor">Editor</Link>
            <a href="#styles">Styles</a>
            <a href="#gallery">Gallery</a>
          </div>
          <div>
            <h5>Studio</h5>
            <a href="#">About</a>
            <a href="#">For architects</a>
            <a href="#">Journal</a>
            <a href="#">Contact</a>
          </div>
          <div>
            <h5>Get started</h5>
            <Link href="/create">Create a design</Link>
            <a href="#">Pricing</a>
            <a href="#">Help center</a>
            <a href="#">Log in</a>
          </div>
        </div>
      </div>
      <div className="wrap ft-bar">
        <span>© 2026 Draft — a student project. Conceptual designs, not construction documents.</span>
        <span>Terms · Privacy</span>
      </div>
    </footer>
  );
}
