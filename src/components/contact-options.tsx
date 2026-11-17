import { ArrowUpRight } from 'lucide-react';

export function ContactOptions({ email }: { email: string }) {
  return (
    <div className="contact-options">
      <div className="email-contact-card">
        <span className="eyebrow">A NOTE, FROM YOU TO ME</span>
        <h3>Let&apos;s make a connection.</h3>
        <p className="email-contact-intro">
          Send a note straight to my email. I would love to hear what you have
          in mind.
        </p>
        {email && (
          <a className="text-link email-direct-link" href={`mailto:${email}`}>
            {email} <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </div>
  );
}
