'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { submitContact, type ContactState } from '@/app/actions';
import { AiCompanion } from './ai-companion';

const answers = {
  'What do you build?':
    'Elsa focuses on language models, retrieval, intelligent agents, and reliable AI systems. Explore the selected work above for the approach behind each project.',
  'How do you approach AI?':
    'Start with a clear problem, build a small baseline, evaluate honestly, and design for the real world. Thoughtful engineering, with room for human judgment.',
  'Leave Elsa a message':
    'Of course. Share your details and a little about your idea below. I’ll pass your message directly to Elsa. Your email gives her a way to reply.',
};

export function ContactChat() {
  const [answer, setAnswer] = useState(answers['Leave Elsa a message']);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [state, action, pending] = useActionState(submitContact, {
    status: 'idle',
    message: '',
  } as ContactState);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const prompts = [
    'First, what’s your name?',
    'Lovely to meet you. Which email should Elsa use to reply?',
    'And what would you like to share with Elsa? A little context goes a long way.',
    'Here’s your message. Ready to pass it along?',
  ];
  const labels = ['Your name', 'Email address', 'A little about your idea'];
  const [error, setError] = useState('');
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }, [step, state, answer]);
  useEffect(() => {
    if (step > 0 && step < 3) input.current?.focus();
  }, [step]);
  function advance(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (step === 0 && value.length < 2)
      return setError('Please enter at least 2 characters.');
    if (step === 1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setError('Please enter a valid email address.');
    if (step === 2 && value.length < 20)
      return setError('Please share a little more (at least 20 characters).');
    setDetails([...details, value]);
    setDraft('');
    setError('');
    setStep(step + 1);
  }
  return (
    <div className="contact-chat">
      <header className="chat-header">
        <AiCompanion />
        <div>
          <span className="eyebrow">ELSA’S PORTFOLIO ASSISTANT</span>
          <p>A thoughtful place to connect.</p>
        </div>
      </header>
      <div
        ref={log}
        className="chat-conversation"
        role="log"
        aria-label="Portfolio assistant"
        aria-live="polite"
      >
        <p className="chat-bubble">{answer}</p>
        {details.map((value, i) => (
          <div key={i}>
            <p className="chat-bubble">{prompts[i]}</p>
            <p className="chat-bubble chat-bubble-visitor">{value}</p>
          </div>
        ))}
        <p className="chat-bubble">{prompts[step]}</p>
      </div>
      <div className="chat-prompts" aria-label="Ask the assistant">
        {Object.entries(answers).map(([question, response]) => (
          <button
            type="button"
            key={question}
            onClick={() => setAnswer(response)}
          >
            {question}
          </button>
        ))}
      </div>
      {step < 3 ? (
        <form onSubmit={advance} className="chat-composer">
          <label htmlFor="chat-draft">{labels[step]}</label>
          <textarea
            ref={input}
            key={step}
            id="chat-draft"
            rows={step === 2 ? 3 : 1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={[100, 254, 3500][step]}
            required
            autoComplete={['name', 'email', 'off'][step]}
            inputMode={step === 1 ? 'email' : 'text'}
            aria-describedby={error ? 'chat-error' : undefined}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p id="chat-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit">
            Continue <ArrowUpRight size={16} />
          </button>
        </form>
      ) : (
        <form action={action} className="chat-send" aria-busy={pending}>
          <input type="hidden" name="name" value={details[0]} />
          <input type="hidden" name="email" value={details[1]} />
          <input type="hidden" name="message" value={details[2]} />
          <input type="hidden" name="topic" value="Collaboration" />
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="chat-website">Leave this empty</label>
            <input
              id="chat-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div role="status" className={'form-status ' + state.status}>
            {state.message}
            {state.errors &&
              Object.values(state.errors)
                .flat()
                .map((message) => <p key={message}>{message}</p>)}
          </div>
          {state.status !== 'success' && (
            <div className="chat-send-actions">
              <button
                type="button"
                className="text-link"
                disabled={pending}
                onClick={() => {
                  setStep(0);
                  setDetails([]);
                  setDraft('');
                }}
              >
                Edit message
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={pending}
              >
                {pending ? 'Sending…' : 'Send message'}
                {pending ? (
                  <LoaderCircle size={16} className="spin" />
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </button>
            </div>
          )}
        </form>
      )}
      <p className="chat-disclosure">
        An automated portfolio guide. Messages go privately to Elsa on Telegram;
        replies come by email, outside this chat.
      </p>
    </div>
  );
}
