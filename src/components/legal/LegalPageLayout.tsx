import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        <Button asChild variant="ghost" size="sm" className="text-sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <header className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div
          className="space-y-6 text-sm leading-relaxed text-foreground
            [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold
            [&_h2]:first:mt-0
            [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
            [&_p]:text-muted-foreground
            [&_li]:text-muted-foreground"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Visible placeholder for content the site owner must fill in before launch. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-yellow-200 px-1 text-foreground dark:bg-yellow-900/60 dark:text-yellow-100">
      {children}
    </mark>
  );
}
