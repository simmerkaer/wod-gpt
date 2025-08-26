import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { User, Shield, Calendar, LogIn, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <LogIn className="h-6 w-6" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Home</span>
              <span className="xs:hidden">Back</span>
            </Link>
          </Button>
        </div>
        <div className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your account information
          </p>
        </div>

        <Card className="mx-2 sm:mx-0">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl truncate">{user.name}</CardTitle>
                <CardDescription className="text-sm sm:text-base truncate">
                  {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <span className="text-sm flex-shrink-0">User ID</span>
                  <span className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded break-all text-right">
                    {user.id}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-shrink-0">Provider</span>
                  <Badge variant="outline" className="capitalize flex-shrink-0">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.provider}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />
            <div className="text-xs text-muted-foreground text-center px-2">
              <Calendar className="h-3 w-3 inline mr-1" />
              <span className="block sm:inline">Profile information is automatically synced</span>
              <span className="block sm:inline"> with your authentication provider</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}