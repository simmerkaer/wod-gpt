import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useAuth";
import { Button } from "../ui/button";

export const UserProfile = () => {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <Button asChild variant="ghost" size="sm" className="gap-2">
      <Link to="/profile">
        <User size={16} />
        <span className="hidden sm:inline">{user.name}</span>
      </Link>
    </Button>
  );
};