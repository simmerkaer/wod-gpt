import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthContextType, AuthResponse, User, ClientPrincipal, Claim } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type IdP = "google" | "github";

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transformClientPrincipal = (clientPrincipal: ClientPrincipal): User => {
    const claimsRecord = clientPrincipal.claims.reduce((acc: Record<string, string>, claim: Claim) => {
      acc[claim.typ] = claim.val;
      return acc;
    }, {});

    return {
      id: clientPrincipal.userId,
      name: clientPrincipal.userDetails,
      email: claimsRecord.email || claimsRecord.emailaddress,
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

  const login = (idp: IdP) => {
    window.location.href = `/.auth/login/${idp}`;
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