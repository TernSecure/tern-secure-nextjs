export { TernSecureAuth } from './auth';
export { SignIn } from './components/signIn';
export { SignUp } from './components/signUp';
export { getTernSecureAuth, getTernSecureDb } from './lib/client-initializer';
export type { TernSecureUser, TernSecureError } from './types';

export const validateOrigin = (origin: string): boolean => {
  // Validate that the request is coming from an allowed domain
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
  return allowedDomains.some(domain => origin.endsWith(domain));
};

export const validateUsage = (apiKey: string): boolean => {
  // Add rate limiting, usage tracking, etc.
  return true;
};