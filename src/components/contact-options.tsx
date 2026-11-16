'use client';
import { useRef, useState } from 'react';
import { Mail, MessageCircle, ArrowUpRight } from 'lucide-react';
import { ContactForm } from './contact-form';
import { ContactChat } from './contact-chat';

export function ContactOptions({ email }: { email: string }) {
  const [selected, setSelected] = useState<'email' | 'chat'>('email');
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="contact-options">
      <div
        className="contact-tabs"
        role="tablist"
        aria-label="Choose how to contact Elsa"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? 1
                : selected === 'email'
                  ? 1
                  : 0;
          setSelected(next === 0 ? 'email' : 'chat');
          buttons.current[next]?.focus();
        }}
      >
        <button
          ref={(element) => {
            buttons.current[0] = element;
          }}
          id="contact-email-tab"
          role="tab"
          aria-selected={selected === 'email'}
          aria-controls="contact-email-panel"
          tabIndex={selected === 'email' ? 0 : -1}
          onClick={() => setSelected('email')}
        >
          <Mail size={16} /> Email / contact form
        </button>
        <button
          ref={(element) => {
            buttons.current[1] = element;
          }}
          id="contact-chat-tab"
          role="tab"
          aria-selected={selected === 'chat'}
          aria-controls="contact-chat-panel"
          tabIndex={selected === 'chat' ? 0 : -1}
          onClick={() => setSelected('chat')}
        >
          <MessageCircle size={16} /> Chatbot
        </button>
      </div>
      <div
        id="contact-email-panel"
        role="tabpanel"
        aria-labelledby="contact-email-tab"
        hidden={selected !== 'email'}
        tabIndex={0}
      >
        <div className="email-contact-card">
          <span className="eyebrow">A NOTE, FROM YOU TO ME</span>
          <h3>Let’s make a connection.</h3>
          <p className="email-contact-intro">
            Prefer a familiar hello? Send a note straight to my email.
          </p>
          {email && (
            <a className="text-link email-direct-link" href={`mailto:${email}`}>
              Open your email app <ArrowUpRight size={15} />
            </a>
          )}
          <ContactForm />
        </div>
      </div>
      <div
        id="contact-chat-panel"
        role="tabpanel"
        aria-labelledby="contact-chat-tab"
        hidden={selected !== 'chat'}
        tabIndex={0}
      >
        <ContactChat />
      </div>
    </div>
  );
}
