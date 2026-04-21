import { cn } from "@/lib/utils";
import type { ChartBar } from "@/types";

interface BarChartProps {
  bars: ChartBar[];
  className?: string;
}

export function BarChart({ bars, className }: BarChartProps) {
  return (
    <div className={cn("grid items-end gap-3", className)} style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}>
      {bars.map((bar, i) => (
        <div key={i} className="relative">
          {/* Label tooltip */}
          <div
            className={cn(
              "absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg whitespace-nowrap z-10",
              bar.highlighted
                ? "bg-bg text-on-surface border border-white/10"
                : "bg-white text-black"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[10px]",
                bar.direction === "down" && "rotate-180"
              )}
              style={{ fontVariationSettings: "'wght' 700", fontSize: "10px" }}
            >
              north_east
            </span>
            {bar.label}
          </div>
          {/* Bar */}
          <div
            className={cn(
              "rounded-2xl transition-all duration-500",
              bar.highlighted ? "bg-white" : "bg-surface-5",
              bar.striped && "stripe-pattern"
            )}
            style={{ height: `${(bar.value / 100) * 128}px` }}
          />
        </div>
      ))}
    </div>
  );
}
