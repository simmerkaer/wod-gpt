import { useAuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  return useAuthContext();
};

export const useUser = () => {
  const { user } = useAuthContext();
  return user;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
};