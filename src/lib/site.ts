import { safeExternalUrl } from './validation';
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const localSiteUrl = 'http://localhost:3000';
export const site = {
  name: 'Elsa Wubie',
  title: 'Elsa Wubie — AI Engineer',
  description:
    'I build thoughtful AI systems. From language models to reliable production infrastructure, I turn complex ideas into useful experiences.',
  url:
    process.env.VERCEL_ENV === 'production' &&
    (!configuredSiteUrl || configuredSiteUrl === localSiteUrl)
      ? 'https://elsiai.chanyalew.com'
      : configuredSiteUrl || localSiteUrl,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  socials: [
    {
      label: 'GitHub',
      url: safeExternalUrl(process.env.NEXT_PUBLIC_GITHUB_URL),
    },
    {
      label: 'LinkedIn',
      url: safeExternalUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL),
    },
    { label: 'X', url: safeExternalUrl(process.env.NEXT_PUBLIC_X_URL) },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url)),
};
