'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="shell state-page">
      <span className="eyebrow">A SMALL INTERRUPTION</span>
      <h1>
        Let’s try <em>that again.</em>
      </h1>
      <p>Something couldn’t be loaded. Your next step is still here.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
      <Link href="/" className="text-link">
        Back to home
      </Link>
    </main>
  );
}
