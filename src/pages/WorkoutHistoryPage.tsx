import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MoreVertical,
  Star,
  Trash2,
  StickyNote,
  LogIn,
  Dumbbell,
  Filter,
} from "lucide-react";
import { SavedWorkout } from "../types/workoutHistory";
import {
  formatWorkoutDate,
  formatWorkoutDateTime,
  getWorkoutPreview,
} from "../types/workoutHistory";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";

interface WorkoutCardProps {
  workout: SavedWorkout;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDelete: (id: string) => void;
  onAddNote: (id: string, notes: string) => void;
}

function WorkoutCard({
  workout,
  onToggleFavorite,
  onDelete,
  onAddNote,
}: WorkoutCardProps) {
  const [showFullWorkout, setShowFullWorkout] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(workout.notes || "");

  const handleToggleFavorite = () => {
    onToggleFavorite(workout.id, !workout.favorite);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this workout?")) {
      onDelete(workout.id);
    }
  };

  const handleSaveNotes = () => {
    onAddNote(workout.id, notesText);
    setEditingNotes(false);
  };

  const formatDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return { text: "Beginner", color: "bg-green-100 text-green-800" };
      case "intermediate":
        return { text: "Intermediate", color: "bg-yellow-100 text-yellow-800" };
      case "advanced":
        return { text: "Advanced", color: "bg-red-100 text-red-800" };
      default:
        return { text: difficulty, color: "bg-gray-100 text-gray-800" };
    }
  };

  const difficultyStyle = formatDifficulty(workout.workout.workout.difficulty);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="capitalize">
                {workout.workout.workout.format.replace("_", " ")}
              </Badge>
              <Badge className={difficultyStyle.color} variant="secondary">
                {difficultyStyle.text}
              </Badge>
              {workout.favorite && (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              )}
            </div>
            <CardTitle className="text-lg mb-1">
              {formatWorkoutDate(workout.completedAt || workout.savedAt)}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatWorkoutDateTime(workout.completedAt || workout.savedAt)}
              </span>
              {workout.workout.timing.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {workout.workout.timing.duration}min
                  {workout.actualDuration &&
                    workout.actualDuration !==
                      workout.workout.timing.duration && (
                      <span className="text-muted-foreground">
                        (actual: {workout.actualDuration}min)
                      </span>
                    )}
                </span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Heart
                  className={`h-4 w-4 mr-2 ${workout.favorite ? "fill-current text-red-500" : ""}`}
                />
                {workout.favorite
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingNotes(true)}>
                <StickyNote className="h-4 w-4 mr-2" />
                {workout.notes ? "Edit notes" : "Add notes"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete workout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Workout Preview/Full Text */}
          <div className="bg-muted/50 p-3 rounded text-sm font-mono whitespace-pre-wrap">
            {showFullWorkout
              ? workout.workout.workout.text
              : getWorkoutPreview(workout.workout.workout.text, 200)}
          </div>

          {workout.workout.workout.text.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullWorkout(!showFullWorkout)}
            >
              {showFullWorkout ? "Show less" : "Show more"}
            </Button>
          )}

          {/* Notes Section */}
          {(workout.notes || editingNotes) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notes</span>
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Add your notes about this workout..."
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNotes}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingNotes(false);
                          setNotesText(workout.notes || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                    {workout.notes}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Rating (for future implementation) */}
          {workout.rating && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm">{workout.rating}/5 stars</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkoutHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Get all workouts
  const {
    workouts: allWorkouts,
    isLoading,
    error,
    totalCount,
    refresh,
    updateWorkout,
    deleteWorkout,
  } = useWorkoutHistory();
  const { toast } = useToast();

  // Apply client-side filtering
  const workouts = showFavoritesOnly
    ? allWorkouts.filter((workout) => workout.favorite === true)
    : allWorkouts;

  const favoriteCount = allWorkouts.filter(
    (workout) => workout.favorite === true,
  ).length;
  const displayTotalCount = showFavoritesOnly ? favoriteCount : totalCount;

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    try {
      await updateWorkout(id, { favorite });
      toast({
        title: favorite ? "Added to favorites ❤️" : "Removed from favorites",
      });
    } catch (error) {
      toast({
        title: "Failed to update favorite",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id);
      toast({
        title: "Workout deleted 🗑️",
      });
    } catch (error) {
      toast({
        title: "Failed to delete workout",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (id: string, notes: string) => {
    try {
      await updateWorkout(id, { notes });
      toast({
        title: "Notes saved 📝",
      });
    } catch (error) {
      toast({
        title: "Failed to save notes",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to workout generation
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <LogIn className="h-6 w-6" />
              </div>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view your workout history.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to profile</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
            <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8" />
            Workout History
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Your saved workouts and progress
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Show favorites only</span>
          <Switch
            checked={showFavoritesOnly}
            onCheckedChange={setShowFavoritesOnly}
          />
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="text-red-700 dark:text-red-300 text-center">
                ⚠️ {error}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  className="ml-2 text-red-700 dark:text-red-300"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {displayTotalCount > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {showFavoritesOnly ? (
              <>Showing {workouts.length} favorite workouts</>
            ) : (
              <>
                Showing {workouts.length} workouts ({favoriteCount} favorites)
              </>
            )}
          </div>
        )}

        {isLoading && workouts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Loading your workout history...
            </div>
          </div>
        ) : workouts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              {showFavoritesOnly ? (
                <>
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No favorite workouts</CardTitle>
                  <CardDescription className="mb-4">
                    {allWorkouts.length > 0
                      ? "You haven't favorited any workouts yet. Add some favorites by clicking the heart icon on your saved workouts!"
                      : "Start generating and saving workouts, then mark your favorites!"}
                  </CardDescription>
                  {allWorkouts.length === 0 ? (
                    <Button asChild>
                      <Link to="/">Generate Your First Workout</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowFavoritesOnly(false)}
                    >
                      Show All Workouts
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No workouts saved yet</CardTitle>
                  <CardDescription className="mb-4">
                    Start generating and saving workouts to build your fitness
                    history!
                  </CardDescription>
                  <Button asChild>
                    <Link to="/">Generate Your First Workout</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
