import { useAuth } from "../hooks/useAuth";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import {
  User,
  Shield,
  Calendar,
  LogIn,
  ArrowLeft,
  Dumbbell,
  Heart,
  Clock,
  TrendingUp,
  Target,
  Flame,
  Award,
  Trophy,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SavedWorkout } from "../types/workoutHistory";
import { formatWorkoutDate } from "../types/workoutHistory";

// Helper function to calculate workout statistics
function calculateWorkoutStats(workouts: SavedWorkout[]) {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      favoriteWorkouts: 0,
      averageRating: 0,
      mostCommonFormat: null,
      recentWorkouts: [],
      workoutStreak: 0,
    };
  }

  const totalWorkouts = workouts.length;
  const favoriteWorkouts = workouts.filter((w) => w.favorite).length;

  // Calculate average rating (only for rated workouts)
  const ratedWorkouts = workouts.filter((w) => w.rating && w.rating > 0);
  const averageRating =
    ratedWorkouts.length > 0
      ? ratedWorkouts.reduce((sum, w) => sum + (w.rating || 0), 0) /
        ratedWorkouts.length
      : 0;

  // Find most common workout format
  const formatCounts = workouts.reduce(
    (counts, workout) => {
      const format = workout.workout.workout.format;
      counts[format] = (counts[format] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  const mostCommonFormat =
    Object.keys(formatCounts).length > 0
      ? Object.entries(formatCounts).reduce((a, b) =>
          formatCounts[a[0]] > formatCounts[b[0]] ? a : b,
        )[0]
      : null;

  // Get recent workouts (last 5)
  const recentWorkouts = [...workouts]
    .sort(
      (a, b) =>
        new Date(b.completedAt || b.savedAt).getTime() -
        new Date(a.completedAt || a.savedAt).getTime(),
    )
    .slice(0, 5);

  // Calculate streaks and dates
  const sortedByDate = [...workouts].sort(
    (a, b) =>
      new Date(b.completedAt || b.savedAt).getTime() -
      new Date(a.completedAt || a.savedAt).getTime(),
  );

  // First workout date
  const firstWorkoutDate =
    workouts.length > 0
      ? workouts.reduce((earliest, workout) => {
          const workoutDate = new Date(workout.completedAt || workout.savedAt);
          const earliestDate = new Date(earliest);
          return workoutDate < earliestDate
            ? workout.completedAt || workout.savedAt
            : earliest;
        }, workouts[0].completedAt || workouts[0].savedAt)
      : null;

  // Calculate current streak and longest streak
  let workoutStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (sortedByDate.length > 0) {
    const today = new Date();
    const dates = new Set();

    // Get unique workout dates
    sortedByDate.forEach((workout) => {
      const workoutDate = new Date(workout.completedAt || workout.savedAt);
      dates.add(workoutDate.toDateString());
    });

    const uniqueDates = Array.from(dates).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );

    // Calculate current streak
    let currentDate = today;
    for (const dateStr of uniqueDates) {
      const workoutDate = new Date(dateStr);
      const daysDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= workoutStreak + 1) {
        if (daysDiff === workoutStreak || daysDiff === workoutStreak + 1) {
          workoutStreak++;
          currentDate = workoutDate;
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    const allDates = Array.from(dates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(allDates[i - 1]);
        const currDate = new Date(allDates[i]);
        const daysDiff = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Most active month
  const monthCounts = workouts.reduce(
    (counts, workout) => {
      const date = new Date(workout.completedAt || workout.savedAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      counts[monthKey] = (counts[monthKey] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  const mostActiveMonth =
    Object.keys(monthCounts).length > 0
      ? Object.entries(monthCounts).reduce((a, b) =>
          monthCounts[a[0]] > monthCounts[b[0]] ? a : b,
        )
      : null;

  // Milestone badges and progress
  const milestones = [
    {
      name: "First Steps",
      description: "Saved your first workout",
      threshold: 1,
      icon: "star",
    },
    {
      name: "Getting Started",
      description: "Saved 5 workouts",
      threshold: 5,
      icon: "zap",
    },
    {
      name: "Dedicated",
      description: "Saved 10 workouts",
      threshold: 10,
      icon: "award",
    },
    {
      name: "Committed",
      description: "Saved 25 workouts",
      threshold: 25,
      icon: "trophy",
    },
    {
      name: "Fitness Enthusiast",
      description: "Saved 50 workouts",
      threshold: 50,
      icon: "flame",
    },
    {
      name: "Workout Warrior",
      description: "Saved 100 workouts",
      threshold: 100,
      icon: "dumbbell",
    },
    {
      name: "Iron Will",
      description: "Saved 150 workouts",
      threshold: 150,
      icon: "target",
    },
    {
      name: "Unstoppable",
      description: "Saved 200 workouts",
      threshold: 200,
      icon: "zap",
    },
    {
      name: "Elite Athlete",
      description: "Saved 300 workouts",
      threshold: 300,
      icon: "award",
    },
    {
      name: "Fitness Master",
      description: "Saved 400 workouts",
      threshold: 400,
      icon: "trophy",
    },
    {
      name: "Beast Mode",
      description: "Saved 500 workouts",
      threshold: 500,
      icon: "flame",
    },
    {
      name: "Legendary",
      description: "Saved 750 workouts",
      threshold: 750,
      icon: "star",
    },
    {
      name: "Immortal",
      description: "Saved 1000 workouts",
      threshold: 1000,
      icon: "trophy",
    },
  ];

  const earnedBadges = milestones.filter(
    (milestone) => totalWorkouts >= milestone.threshold,
  );
  const nextMilestone = milestones.find(
    (milestone) => totalWorkouts < milestone.threshold,
  );
  const progressToNext = nextMilestone
    ? {
        milestone: nextMilestone,
        progress: totalWorkouts,
        remaining: nextMilestone.threshold - totalWorkouts,
      }
    : null;

  return {
    totalWorkouts,
    favoriteWorkouts,
    averageRating,
    mostCommonFormat,
    recentWorkouts,
    workoutStreak,
    firstWorkoutDate,
    longestStreak,
    mostActiveMonth,
    earnedBadges,
    progressToNext,
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { workouts, isLoading: workoutsLoading } = useWorkoutHistory(
    undefined,
    true,
  ); // Get all workouts for statistics

  const workoutStats = calculateWorkoutStats(workouts);

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
              <span className="hidden xs:inline">
                Back to workout generation
              </span>
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
            <div className="space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl truncate">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base truncate">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link to="/">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Generate Workout
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Workout Statistics Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl">
                  Fitness Journey
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your workout statistics and progress
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {workoutsLoading ? (
              <div className="text-center py-4">
                <div className="animate-pulse text-muted-foreground">
                  Loading workout stats...
                </div>
              </div>
            ) : workoutStats.totalWorkouts === 0 ? (
              <div className="text-center py-6">
                <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  No workouts saved yet
                </p>
                <Button asChild size="sm">
                  <Link to="/">Start Your Fitness Journey</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Key Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {workoutStats.totalWorkouts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Workouts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4 fill-current" />
                      {workoutStats.favoriteWorkouts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Favorites
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4" />
                      {workoutStats.workoutStreak}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Day Streak
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                    Workout Insights
                  </h3>

                  {workoutStats.mostCommonFormat && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        Preferred Format
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {workoutStats.mostCommonFormat.replace("_", " ")}
                      </Badge>
                    </div>
                  )}

                  {workoutStats.averageRating > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        Average Rating
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.round(workoutStats.averageRating)
                                ? "text-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({workoutStats.averageRating.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Additional Workout Insights */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                    Your Fitness Journey
                  </h3>

                  {workoutStats.firstWorkoutDate && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        First Workout
                      </span>
                      <span className="text-sm font-medium">
                        {formatWorkoutDate(workoutStats.firstWorkoutDate)}
                      </span>
                    </div>
                  )}

                  {workoutStats.longestStreak > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Longest Streak
                      </span>
                      <span className="text-sm font-medium">
                        {workoutStats.longestStreak}{" "}
                        {workoutStats.longestStreak === 1 ? "day" : "days"}
                      </span>
                    </div>
                  )}

                  {workoutStats.mostActiveMonth && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Most Active Month
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium block">
                          {new Date(
                            workoutStats.mostActiveMonth[0] + "-01",
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {workoutStats.mostActiveMonth[1]} workouts
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone Badges */}
                {workoutStats.earnedBadges.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                        Achievements
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {workoutStats.earnedBadges.map((badge) => {
                          const IconComponent =
                            badge.icon === "star"
                              ? Star
                              : badge.icon === "zap"
                                ? Zap
                                : badge.icon === "award"
                                  ? Award
                                  : badge.icon === "trophy"
                                    ? Trophy
                                    : badge.icon === "flame"
                                      ? Flame
                                      : Dumbbell;

                          return (
                            <div
                              key={badge.name}
                              className="flex flex-col items-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center"
                            >
                              <IconComponent className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mb-1" />
                              <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                {badge.name}
                              </span>
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                {badge.threshold}+ workouts
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Progress to Next Goal */}
                {workoutStats.progressToNext && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                        Next Milestone
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            {workoutStats.progressToNext.milestone.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {workoutStats.progressToNext.remaining} to go
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(workoutStats.progressToNext.progress / workoutStats.progressToNext.milestone.threshold) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{workoutStats.progressToNext.progress}</span>
                            <span>
                              {workoutStats.progressToNext.milestone.threshold}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Recent Workouts */}
                {workoutStats.recentWorkouts.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Recent Workouts
                        </h3>
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/history">View All</Link>
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {workoutStats.recentWorkouts
                          .slice(0, 3)
                          .map((workout) => (
                            <div
                              key={workout.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize flex-shrink-0"
                                >
                                  {workout.workout.workout.format.replace(
                                    "_",
                                    " ",
                                  )}
                                </Badge>
                                <span className="truncate">
                                  {formatWorkoutDate(
                                    workout.completedAt || workout.savedAt,
                                  )}
                                </span>
                                {workout.favorite && (
                                  <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
                                )}
                              </div>
                              {workout.workout.timing.duration > 0 && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {workout.workout.timing.duration}min
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
