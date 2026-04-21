import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: string;
}

export function MaterialIcon({ name, filled, className, size }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined,
        fontSize: size,
      }}
    >
      {name}
    </span>
  );
}
