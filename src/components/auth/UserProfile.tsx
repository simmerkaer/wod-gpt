import { User } from "lucide-react";
import { useUser } from "../../hooks/useAuth";

export const UserProfile = () => {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <User size={16} />
      <span className="hidden sm:inline">{user.name}</span>
    </div>
  );
};