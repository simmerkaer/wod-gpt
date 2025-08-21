import { useIsAuthenticated } from "../../hooks/useAuth";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";

export const AuthButton = () => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};