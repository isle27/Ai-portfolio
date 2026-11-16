'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { submitEmailContact, type ContactState } from '@/app/actions';
const initial: ContactState = { status: 'idle', message: '' };
const emptyDraft = { name: '', email: '', topic: 'Collaboration', message: '' };
export function ContactForm() {
  const [draft, setDraft] = useState(emptyDraft);
  const [state, action, pending] = useActionState(submitEmailContact, initial);
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === 'success') setDraft(emptyDraft);
    if (state.status !== 'idle') status.current?.focus();
  }, [state]);
  const err = (name: string) => state.errors?.[name]?.[0];
  return (
    <form
      ref={form}
      action={action}
      className="contact-form"
      aria-label="Contact Elsa"
      aria-busy={pending}
    >
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            autoComplete="name"
            placeholder="Alex Morgan"
            required
            minLength={2}
            maxLength={100}
            aria-invalid={!!err('name')}
            aria-describedby={err('name') ? 'name-error' : undefined}
          />
          {err('name') && (
            <span className="field-error" id="name-error">
              {err('name')}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            value={draft.email}
            onChange={(event) =>
              setDraft({ ...draft, email: event.target.value })
            }
            type="email"
            autoComplete="email"
            placeholder="alex@company.com"
            required
            maxLength={254}
            aria-invalid={!!err('email')}
            aria-describedby={err('email') ? 'email-error' : undefined}
          />
          {err('email') && (
            <span className="field-error" id="email-error">
              {err('email')}
            </span>
          )}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="topic">What’s on your mind?</label>
        <select
          name="topic"
          id="topic"
          value={draft.topic}
          onChange={(event) =>
            setDraft({ ...draft, topic: event.target.value })
          }
        >
          <option>Collaboration</option>
          <option>Full-time role</option>
          <option>Research</option>
          <option>Just saying hello</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="message">A little about your idea</label>
        <textarea
          id="message"
          name="message"
          value={draft.message}
          onChange={(event) =>
            setDraft({ ...draft, message: event.target.value })
          }
          rows={4}
          required
          minLength={20}
          maxLength={3500}
          placeholder="The problem you’re exploring, the thing you want to build…"
          aria-invalid={!!err('message')}
          aria-describedby={err('message') ? 'message-error' : undefined}
        />
        {err('message') && (
          <span className="field-error" id="message-error">
            {err('message')}
          </span>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={'form-status ' + state.status}
      >
        {state.status === 'success' && <Check size={18} />} {state.message}
      </div>
      <div className="form-bottom">
        <span>
          Your details stay private.
          <br />
          Just a conversation, no mailing lists.
        </span>
        <button
          className="button button-primary"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Sending…' : 'Send message'}
          {pending ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </button>
      </div>
    </form>
  );
}
