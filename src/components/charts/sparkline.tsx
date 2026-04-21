import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  className?: string;
}

export function Sparkline({ values, className }: SparklineProps) {
  const max = Math.max(...values);
  return (
    <div className={cn("flex items-end gap-1 h-full opacity-40", className)}>
      {values.map((v, i) => (
        <div
          key={i}
          className="bg-primary w-2 rounded-t-full"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
