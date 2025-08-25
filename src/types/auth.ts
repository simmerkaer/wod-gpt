import { IdP } from "@/contexts/AuthContext";

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims: Claim[];
}

export interface Claim {
  typ: string;
  val: string;
}

export interface AuthResponse {
  clientPrincipal: ClientPrincipal | null;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  provider: string;
  roles: string[];
  claims: Record<string, string>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (idp: IdP) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}