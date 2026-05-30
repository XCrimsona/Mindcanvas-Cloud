// =========================================================================
// AuthRedirectContext — the one place auth-expiry redirects are wired.
//
// WHY THIS EXISTS:
//   useNavigate() is a hook. Hooks only work during React's render phase.
//   Calling navigate() from inside a fetch .then / await callback works
//   because the navigate FUNCTION was captured during render — but calling
//   useNavigate() itself from async code throws "Invalid hook call".
//
//   The old urlRedirector() did exactly that and broke every CRUD handler
//   on auth expiry. This module fixes it by capturing navigate() once
//   inside <AuthRedirectProvider>, stashing it in a module-level ref, and
//   exposing redirectToSignIn() / redirectTo() — both safe to call from
//   anywhere (async callbacks, plain utility modules, you name it).
//
// FALLBACK:
//   If the provider isn't mounted (caller lives outside the Router tree
//   somehow), window.location.assign() takes over. The user still ends up
//   on /signin-portal — just via a hard nav instead of SPA nav.
//
// USAGE:
//   // in any async handler:
//   if (body.message === "Not Authenticated") { redirectToSignIn(); return; }
//
//   // in a component that prefers the React-idiomatic style:
//   const { redirectToSignIn } = useAuthRedirect();
// =========================================================================
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";

const SIGNIN_ROUTE = "/signin-portal";

// Module-level ref to the latest navigate function captured by the provider.
// Async callbacks (fetch .then, awaited code) can safely call redirectToSignIn()
// without re-invoking useNavigate() outside a render — the navigate was
// captured during the provider's render and stored here.
let navigateRef: NavigateFunction | null = null;

export const redirectToSignIn = (): void => {
  if (navigateRef) {
    navigateRef(SIGNIN_ROUTE, { replace: true });
    return;
  }
  // Fallback: provider hasn't mounted (e.g. caller is outside the Router tree).
  // Hard navigation is safe because the sign-in route is a top-level page.
  if (typeof window !== "undefined") {
    window.location.assign(SIGNIN_ROUTE);
  }
};

export const redirectTo = (path: string): void => {
  if (navigateRef) {
    navigateRef(path);
    return;
  }
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
};

interface IAuthRedirectContext {
  redirectToSignIn: () => void;
  redirectTo: (path: string) => void;
}

const AuthRedirectContext = createContext<IAuthRedirectContext | null>(null);

export const AuthRedirectProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const localRef = useRef<NavigateFunction>(navigate);
  localRef.current = navigate;
  navigateRef = navigate;

  useEffect(() => {
    return () => {
      if (navigateRef === localRef.current) navigateRef = null;
    };
  }, []);

  return (
    <AuthRedirectContext.Provider value={{ redirectToSignIn, redirectTo }}>
      {children}
    </AuthRedirectContext.Provider>
  );
};

export const useAuthRedirect = () => {
  const ctx = useContext(AuthRedirectContext);
  if (!ctx) {
    throw new Error(
      "useAuthRedirect must be used within an AuthRedirectProvider",
    );
  }
  return ctx;
};
