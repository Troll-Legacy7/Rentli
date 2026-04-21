import { cn } from "@/lib/utils";

interface DonutChartProps {
  percentage: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function DonutChart({
  percentage,
  label,
  sublabel,
  size = 192,
  strokeWidth = 14,
  className,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-5/30"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth + 4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-headline">{label}</span>
          {sublabel && (
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
