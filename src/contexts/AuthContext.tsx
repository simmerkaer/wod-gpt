import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthContextType,
  AuthResponse,
  User,
  ClientPrincipal,
  Claim,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const EMAIL_CLAIM_KEYS = [
  "email",
  "emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transformClientPrincipal = (clientPrincipal: ClientPrincipal): User => {
    const claims = clientPrincipal.claims || [];
    const claimsRecord = claims.reduce(
      (acc: Record<string, string>, claim: Claim) => {
        acc[claim.typ] = claim.val;
        return acc;
      },
      {},
    );

    const email = EMAIL_CLAIM_KEYS.map((k) => claimsRecord[k]).find(Boolean);
    // For Auth0 sign-ins, userDetails is the email (nameClaimType set so it is
    // visible to the API). Prefer the `name` claim for human-readable display.
    const displayName =
      claimsRecord["name"] ||
      claimsRecord["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      clientPrincipal.userDetails;

    return {
      id: clientPrincipal.userId,
      name: displayName,
      email,
      provider: clientPrincipal.identityProvider,
      roles: clientPrincipal.userRoles,
      claims: claimsRecord,
    };
  };

  const fetchUser = async (): Promise<User | null> => {
    try {
      const response = await fetch("/.auth/me");
      if (!response.ok) {
        return null;
      }
      const authData: AuthResponse = await response.json();
      if (authData.clientPrincipal) {
        return transformClientPrincipal(authData.clientPrincipal);
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    const userData = await fetchUser();
    setUser(userData);
    setIsLoading(false);
  };

  const login = () => {
    // The SWA CLI emulator can't run a real login for custom OIDC providers:
    // its route regex only matches letter-only provider names ("auth0" 404s),
    // and google/github/aad/facebook/twitter/dummy are routed to a real OAuth
    // flow that requires client-id env vars. Any other letters-only name falls
    // through to the emulator's mock login form, so use one in dev.
    const provider = import.meta.env.DEV ? "mock" : "auth0";
    window.location.href = `/.auth/login/${provider}`;
  };

  const logout = () => {
    window.location.href = "/.auth/logout";
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
