'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import type { Project } from '@/db/schema';
import { Reveal } from './motion';
import { ProjectArt } from './project-art';
export function Projects({
  projects,
  mode,
}: {
  projects: Project[];
  mode: 'preview' | 'live' | 'error';
}) {
  const [category, setCategory] = useState('All work');
  const categories = ['All work', ...new Set(projects.map((p) => p.category))];
  const visible = projects.filter(
    (p) => category === 'All work' || p.category === category,
  );
  return (
    <section className="section work-section" id="work">
      <div className="shell">
        <Reveal>
          <div className="section-top">
            <span className="eyebrow">SELECTED WORK</span>
            <span className="section-note">Ideas made tangible.</span>
          </div>
          <div className="section-heading">
            <h2>
              Built with intent.
              <br />
              <em>Designed to matter.</em>
            </h2>
            <p>
              I connect the possibilities of AI
              <br className="desktop-break" /> with the realities of building
              for people.
            </p>
          </div>
        </Reveal>
        {mode === 'preview' && (
          <p className="preview-note">
            A collection of illustrative project concepts. Case studies are
            examples, not claims of shipped work.
          </p>
        )}
        <div className="filters" role="group" aria-label="Filter projects">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="project-grid">
          {visible.map((p) => (
            <Reveal key={p.slug}>
              <Link href={'/projects/' + p.slug} className="project-card">
                <ProjectArt index={projects.indexOf(p) % 4} />
                <div className="project-meta">
                  <span>{p.category}</span>
                  <span>{p.sample ? 'CONCEPT STUDY' : 'CASE STUDY'}</span>
                </div>
                <div className="project-title">
                  <h3>{p.title}</h3>
                  <span className="project-arrow">
                    <ArrowUpRight size={21} />
                  </span>
                </div>
                <p>{p.description}</p>
                <div className="project-stack">
                  {p.stack.slice(0, 3).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty-state">
            <span className="eyebrow">A LITTLE ROOM FOR WHAT’S NEXT</span>
            <h3>
              {mode === 'error'
                ? 'The work is taking a moment.'
                : 'New work is on the way.'}
            </h3>
            <p>
              {mode === 'error'
                ? 'Projects could not be loaded. Please try again shortly.'
                : 'I’m making space for the next interesting challenge.'}
            </p>
            <a href="#contact">
              Start a conversation <ArrowRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
