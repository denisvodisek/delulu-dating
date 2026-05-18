import { cn } from "@/lib/utils";

type DeluluCloudLogoProps = {
  label: string;
  className?: string;
};

/** Puffy cloud + wordmark (Phudu on the wordmark via font-lab-display). */
export function DeluluCloudLogo({ label, className }: DeluluCloudLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 md:gap-2.5", className)}>
      <svg
        className="h-9 w-auto shrink-0 md:h-10"
        viewBox="0 0 84 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fill="#E8F7FF"
          stroke="#0a1f2d"
          strokeWidth="2.25"
          strokeLinejoin="round"
          d="M62.2 40H22.4c-8.9 0-16-7-15.8-15.8C6.8 15.5 14 9 23 9.5c2-9.2 10.6-15.8 20.2-14.6 6.8.8 12.6 5.6 15 12.1 2-.4 4-.6 6-.6 11 0 19.8 9 19.6 20-.2 9.8-8.4 18-18.3 18h-.3Z"
        />
      </svg>
      <span className="font-lab-display text-lab-on-surface text-lg font-extrabold tracking-tight uppercase md:text-xl">
        {label}
      </span>
    </span>
  );
}
