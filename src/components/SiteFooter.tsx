import { Link } from "react-router-dom";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        aria-label="Legal"
      >
        <Link
          to="/terms"
          className="hover:text-foreground hover:underline underline-offset-2"
        >
          Terms
        </Link>
        <Link
          to="/privacy"
          className="hover:text-foreground hover:underline underline-offset-2"
        >
          Privacy
        </Link>
        <Link
          to="/cookies"
          className="hover:text-foreground hover:underline underline-offset-2"
        >
          Cookies
        </Link>
      </nav>
      <p className="mt-3">© {year} WOD-GPT</p>
    </footer>
  );
}
