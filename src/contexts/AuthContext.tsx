import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  AuthContextType,
  AuthProvider as AuthProviderName,
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
  const [authProvider, setAuthProvider] = useState<AuthProviderName>("google");

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

    return {
      id: clientPrincipal.userId,
      name: clientPrincipal.userDetails,
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

  const fetchConfig = async (): Promise<AuthProviderName> => {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) return "google";
      const data = (await response.json()) as { authProvider?: string };
      return data.authProvider === "auth0" ? "auth0" : "google";
    } catch {
      return "google";
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    const userData = await fetchUser();
    setUser(userData);
    setIsLoading(false);
  };

  const login = () => {
    window.location.href = `/.auth/login/${authProvider}`;
  };

  const logout = () => {
    window.location.href = "/.auth/logout";
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [provider, userData] = await Promise.all([fetchConfig(), fetchUser()]);
      setAuthProvider(provider);
      setUser(userData);
      setIsLoading(false);
    })();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    authProvider,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
