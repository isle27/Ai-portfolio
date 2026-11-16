import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { getProjects } from '@/lib/projects';
import { safeExternalUrl } from '@/lib/validation';
import { ProjectArt } from '@/components/project-art';
export const dynamic = 'force-dynamic';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getProjects();
  const p = projects.find((p) => p.slug === slug);
  return {
    title: p?.title || 'Project unavailable',
    description: p?.description,
    alternates: { canonical: '/projects/' + slug },
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjects();
  if (data.mode === 'error') throw new Error('Projects unavailable');
  const p = data.projects.find((p) => p.slug === slug);
  if (!p) notFound();
  const github = safeExternalUrl(p.githubUrl),
    demo = safeExternalUrl(p.demoUrl);
  return (
    <main id="main" className="shell project-detail">
      <Link className="text-link" href="/#work">
        <ArrowLeft size={16} /> Back to selected work
      </Link>
      <div className="detail-heading">
        <span className="eyebrow">
          {p.category} / {p.sample ? 'ILLUSTRATIVE CONCEPT' : 'CASE STUDY'}
        </span>
        <h1>
          {p.title}
          <em>.</em>
        </h1>
        <p>{p.description}</p>
      </div>
      <ProjectArt index={data.projects.indexOf(p) % 4} />
      <div className="detail-grid">
        <article>
          <span className="eyebrow">THE IDEA</span>
          <h2>
            Built around
            <br />
            <em>a clear purpose.</em>
          </h2>
          <p>{p.overview}</p>
          {p.sample && (
            <p className="concept-disclosure">
              This is a sample project concept prepared for this portfolio. The
              architecture and outcomes describe intended capabilities, not
              verified deployments or measured results.
            </p>
          )}
          <Link href="/#contact" className="button button-primary">
            Discuss this kind of work <ArrowUpRight size={17} />
          </Link>
        </article>
        <aside>
          <span className="eyebrow">KEY CAPABILITIES</span>
          <ul className="outcomes">
            {p.outcomes.map((o) => (
              <li key={o}>
                <Check size={17} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
          <span className="eyebrow">TECHNOLOGY</span>
          <div className="detail-stack">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="detail-links">
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer">
                View source <ArrowUpRight size={17} />
              </a>
            )}
            {demo && (
              <a href={demo} target="_blank" rel="noopener noreferrer">
                Explore live project <ArrowUpRight size={17} />
              </a>
            )}
            {!github && !demo && (
              <p>Public links will be added when available.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
