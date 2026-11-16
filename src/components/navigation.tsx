'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
const links = [
  ['Work', 'work'],
  ['About', 'about'],
  ['Expertise', 'expertise'],
];
export function Navigation() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link href="/" className="wordmark" aria-label="Elsa Wubie home">
          <span className="wordmark-symbol" aria-hidden="true">
            e.
          </span>
          <span className="wordmark-name">
            Elsa Wubie<small>AI engineer</small>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map(([label, id]) => (
            <Link key={id} href={'/#' + id}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="nav-contact" href="/#contact">
          Let’s talk <ArrowUpRight size={15} />
        </Link>
        <button
          className="menu-button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[...links, ['Contact', 'contact']].map(([label, id]) => (
            <Link key={id} onClick={() => setOpen(false)} href={'/#' + id}>
              {label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
