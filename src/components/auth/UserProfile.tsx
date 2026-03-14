import { useUser } from "../../hooks/useAuth";

export const UserProfile = () => {
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-w-0 text-left">
      <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
      {user.email && (
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      )}
    </div>
  );
};
