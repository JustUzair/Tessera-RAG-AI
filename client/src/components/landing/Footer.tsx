import Link from "next/link";
import { TesseraLogo } from "@/components/layout/TesseraLogo";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6 md:px-10">
      <div
        className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                      justify-between gap-4"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-muted hover:text-foreground transition-colors"
        >
          <TesseraLogo className="w-5 h-5" />
          <span className="text-sm font-display font-medium">Tessera</span>
        </Link>
        <p className="text-xs text-muted text-center">
          Fragments that only make sense assembled together.
        </p>
      </div>
    </footer>
  );
}
