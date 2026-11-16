import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound() {
  return (
    <main id="main" className="shell state-page">
      <span className="eyebrow">404 / UNCHARTED TERRITORY</span>
      <h1>
        A little <em>off the map.</em>
      </h1>
      <p>This page doesn’t exist, but there’s plenty to explore.</p>
      <Link className="button button-primary" href="/">
        Back to the good stuff <ArrowUpRight size={17} />
      </Link>
    </main>
  );
}
