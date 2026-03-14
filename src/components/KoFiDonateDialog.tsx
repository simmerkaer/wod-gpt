import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

const KOFI_EMBED_SRC =
  "https://ko-fi.com/wodgpt/?hidefeed=true&widget=true&embed=true&preview=true";

export function KoFiDonateDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="flex max-h-[90dvh] w-[min(100vw-1rem,440px)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 text-left">
          <DialogTitle>Support on Ko-fi</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-2">
          <iframe
            id="kofiframe"
            src={KOFI_EMBED_SRC}
            className="w-full rounded-md border-0 bg-[#f9f9f9] p-1 dark:bg-[#f9f9f9]"
            style={{ minHeight: "min(712px, 65dvh)" }}
            height={712}
            title="Support WOD-GPT on Ko-fi"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
