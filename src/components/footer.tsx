import Link from 'next/link';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { site } from '@/lib/site';
export function Footer() {
  return (
    <footer className="shell footer">
      <Link className="footer-signature" href="/">
        Elsa Wubie<span>Thoughtful systems. Useful intelligence.</span>
      </Link>
      <div className="footer-socials">
        {site.socials.map((s) => (
          <a
            href={s.url}
            key={s.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.label}
            <ArrowUpRight size={13} />
          </a>
        ))}
      </div>
      <div className="footer-end">
        <span>© {new Date().getFullYear()} Elsa Wubie</span>
        <a href="#top" aria-label="Back to top">
          <ArrowUp size={18} />
        </a>
      </div>
    </footer>
  );
}
