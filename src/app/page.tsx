import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDown,
  MoveRight,
  Braces,
  Workflow,
  ScanLine,
  Layers3,
} from 'lucide-react';
import { Reveal } from '@/components/motion';
import { Projects } from '@/components/projects';
import { ContactOptions } from '@/components/contact-options';
import { NeuralBackground } from '@/components/neural-background';
import { Portrait } from '@/components/portrait';
import { getProjects } from '@/lib/projects';
import { site } from '@/lib/site';
export const dynamic = 'force-dynamic';
const expertise = [
  {
    icon: Braces,
    title: 'Language & reasoning',
    description: 'Giving language models context, tools, and a clear purpose.',
    skills: [
      'LLMs & fine-tuning',
      'Retrieval-augmented generation',
      'Prompt & context engineering',
    ],
  },
  {
    icon: Workflow,
    title: 'Agents & orchestration',
    description:
      'Building systems that act with intention, within thoughtful boundaries.',
    skills: [
      'Agentic workflows',
      'Tool use & orchestration',
      'Human-in-the-loop systems',
    ],
  },
  {
    icon: ScanLine,
    title: 'Evaluation & trust',
    description:
      'Measuring what matters. Understanding where a system falls short.',
    skills: [
      'LLM evaluation',
      'Observability & tracing',
      'Safety & reliability',
    ],
  },
  {
    icon: Layers3,
    title: 'From model to product',
    description: 'Bridging experimentation and the realities of production.',
    skills: [
      'Python & PyTorch',
      'APIs & model serving',
      'MLOps, Docker & CI/CD',
    ],
  },
];
export default async function Home() {
  const data = await getProjects();
  return (
    <main id="main">
      <section className="shell hero">
        <NeuralBackground />
        <div className="hero-copy">
          <Reveal>
            <div className="eyebrow hero-eyebrow">
              <span className="status-dot" /> ELSA WUBIE{' '}
              <span className="eyebrow-divider">/</span> AI ENGINEER
            </div>
            <h1>
              Intelligence,
              <br />
              with <em>intention.</em>
            </h1>
            <p className="hero-description">
              I build AI systems that move beyond possibility.
              <br className="desktop-break" /> Thoughtfully engineered. Grounded
              in the real world.
              <br className="desktop-break" /> Made to be useful.
            </p>
            <div className="hero-actions">
              <Link href="#work" className="button button-primary">
                Explore my work <ArrowUpRight size={18} />
              </Link>
              <Link href="#contact" className="text-link">
                Let’s build something <MoveRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
        <Portrait />
        <div className="hero-bottom">
          <a href="#work">
            <ArrowDown size={14} />
            <span>SCROLL TO EXPLORE</span>
          </a>
          <span>CURIOUS BY NATURE. PRECISE BY DESIGN.</span>
        </div>
      </section>
      <div className="principles-strip">
        <div className="shell">
          <span>Where I focus</span>
          <p>
            Language models<i>·</i> Intelligent agents<i>·</i> Reliable systems
            <i>·</i> Human impact
          </p>
        </div>
      </div>
      <Projects projects={data.projects} mode={data.mode} />
      <section className="section about-section" id="about">
        <div className="shell about-grid">
          <Reveal>
            <span className="eyebrow">THE HUMAN BEHIND THE SYSTEMS</span>
            <div className="about-mark" aria-hidden="true">
              <span className="about-initial">ew.</span>
              <div className="about-rule" />
              <p>
                Always learning.
                <br />
                Always building.
              </p>
              <span className="about-mark-caption">A human perspective.</span>
            </div>
          </Reveal>
          <Reveal>
            <h2>
              Curiosity is the start.
              <br />
              <em>Care is the difference.</em>
            </h2>
            <div className="about-copy">
              <p>
                I’m Elsa, an AI engineer drawn to the space between what a model
                can do and what people actually need.
              </p>
              <p>
                I approach AI as a systems problem: the data, the model, the
                evaluation, and the experience all have to work together. I care
                as much about the quiet details — a useful fallback, a clear
                explanation, a reliable deployment — as the breakthrough moment.
              </p>
              <p>
                My north star is simple: build things that earn people’s trust,
                and keep asking better questions along the way.
              </p>
            </div>
            <div className="signature">
              Elsa Wubie <span>Engineer. Builder. Perpetual learner.</span>
            </div>
          </Reveal>
        </div>
      </section>
      <section id="expertise" className="section expertise-section">
        <div className="shell">
          <Reveal>
            <div className="section-top">
              <span className="eyebrow">MY TOOLKIT</span>
              <span className="section-note">
                Depth where it matters. Breadth where it helps.
              </span>
            </div>
            <div className="section-heading">
              <h2>
                A systems mindset.
                <br />
                <em>An engineer’s craft.</em>
              </h2>
              <p>
                From the first experiment
                <br />
                to a system you can depend on.
              </p>
            </div>
          </Reveal>
          <div className="expertise-grid">
            {expertise.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.06}>
                <article className="expertise-card">
                  <div className="expertise-top">
                    <e.icon size={19} strokeWidth={1.15} aria-hidden="true" />
                  </div>
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <ul>
                    {e.skills.map((s) => (
                      <li key={s}>
                        <span /> {s}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section approach-section" id="experience">
        <div className="shell approach-grid">
          <Reveal>
            <span className="eyebrow">THE WAY I WORK</span>
            <h2>
              Less magic.
              <br />
              <em>More method.</em>
            </h2>
            <p className="approach-intro">
              Good AI engineering is a practice, not a single model choice.
              Here’s how I move from an open question to a dependable system.
            </p>
            <p className="content-note">
              A working philosophy. A verified career timeline will be added
              here.
            </p>
          </Reveal>
          <div className="timeline">
            {[
              {
                title: 'Understand before optimizing',
                text: 'Start with the person, the problem, and what success would actually look like. A clear question is the most useful tool.',
              },
              {
                title: 'Experiment with discipline',
                text: 'Build a small baseline, test assumptions, and evaluate honestly. Let evidence decide what earns a place in the system.',
              },
              {
                title: 'Build for the real world',
                text: 'Design for latency, cost, failure, and change. Keep the system observable and leave room for human judgment.',
              },
            ].map((x, i) => (
              <Reveal key={x.title} delay={i * 0.06}>
                <article className="timeline-item">
                  <span className="timeline-marker" aria-hidden="true" />
                  <div>
                    <h3>{x.title}</h3>
                    <p>{x.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="section contact-section">
        <div className="shell contact-grid">
          <Reveal>
            <span className="eyebrow">WHAT’S NEXT?</span>
            <h2>
              Good things start
              <br />
              with <em>a conversation.</em>
            </h2>
            <p>
              Have a meaningful problem, an ambitious idea,
              <br className="desktop-break" /> or a different way of seeing
              things?
              <br />
              I’d love to hear about it.
            </p>
            {site.email && (
              <a className="contact-email" href={'mailto:' + site.email}>
                {site.email}
                <ArrowUpRight size={20} />
              </a>
            )}
            <div className="contact-note">
              <span className="status-dot" /> OPEN TO THOUGHTFUL CONVERSATIONS
            </div>
          </Reveal>
          <Reveal>
            <ContactOptions email={site.email} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
