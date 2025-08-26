import { useUser } from "../../hooks/useAuth";
import { Badge } from "../ui/badge";

export const UserProfile = () => {
  const user = useUser();

  if (!user) {
    return null;
  }

  return <Badge variant={"outline"}>{user.name}</Badge>;
};
