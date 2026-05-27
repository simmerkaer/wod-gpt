import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface LegalPageLayoutProps {
  /** Omit when the embedded content already provides its own heading. */
  title?: string;
  lastUpdated?: string;
  /**
   * When true, render children without the built-in prose styling — use for
   * embedded HTML (e.g. a Termly export) that ships its own styles.
   */
  bare?: boolean;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  bare = false,
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

        {title && (
          <header className="space-y-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            )}
          </header>
        )}

        {bare ? (
          children
        ) : (
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
        )}
      </div>
    </div>
  );
}

/**
 * Renders pasted legal HTML (e.g. a Termly export) on a forced-light card so
 * the document's hardcoded black text stays readable regardless of the app
 * theme. The content is static, owner-provided HTML — not user input.
 */
export function EmbeddedLegalHtml({ html }: { html: string }) {
  return (
    <div
      className="overflow-x-auto rounded-lg bg-white p-4 text-black shadow-sm sm:p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

