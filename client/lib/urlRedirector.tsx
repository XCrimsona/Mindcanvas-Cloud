import { redirectTo } from "./auth-redirect/AuthRedirectContext";

// Backwards-compatible shim. The original implementation called useNavigate()
// from a plain function, which violated the Rules of Hooks and produced the
// "Invalid hook call" error whenever it ran from an async callback.
//
// The real navigator is now captured inside <AuthRedirectProvider> (mounted in
// main.tsx). Prefer importing redirectToSignIn / useAuthRedirect directly from
// "./auth-redirect/AuthRedirectContext" in new code.
const urlRedirector = (urlPiece: string): void => {
  redirectTo(urlPiece);
};

export default urlRedirector;
export { urlRedirector };
