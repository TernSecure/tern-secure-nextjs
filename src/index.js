export { TernSecureAuth } from './auth';
export { SignIn } from './components/signIn';
export { SignUp } from './components/signUp';
export { getTernSecureAuth, getTernSecureDb } from './lib/client-initializer';
export const validateOrigin = (origin) => {
    var _a;
    // Validate that the request is coming from an allowed domain
    const allowedDomains = ((_a = process.env.ALLOWED_DOMAINS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
    return allowedDomains.some(domain => origin.endsWith(domain));
};
export const validateUsage = (apiKey) => {
    // Add rate limiting, usage tracking, etc.
    return true;
};
