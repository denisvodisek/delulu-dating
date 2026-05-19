import { cn } from "@/lib/utils";

type DeluluCloudLogoProps = {
  className?: string;
};

/** Dreamy cloud-styled “Delulu” wordmark (no separate icon). */
export function DeluluCloudLogo({ className }: DeluluCloudLogoProps) {
  return (
    <span className={cn("delulu-wordmark select-none", className)} translate="no">
      Delulu
    </span>
  );
}
