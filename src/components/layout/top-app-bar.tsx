import { cn } from "@/lib/utils";
import { MaterialIcon } from "./icon";

interface TopAppBarProps {
  greeting: string;
  date: string;
  avatarUrl: string;
  variant?: "landlord" | "tenant";
  className?: string;
}

export function TopAppBar({ greeting, date, avatarUrl, variant = "landlord", className }: TopAppBarProps) {
  return (
    <header
      className={cn(
        "bg-bg/80 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 border-b border-white/5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {variant === "tenant" && (
          <div className="bg-surface-3 p-2 rounded-xl">
            <MaterialIcon name="menu" className="text-on-surface" />
          </div>
        )}
        <div>
          <h2 className="text-on-surface text-sm font-semibold lg:text-xl lg:font-bold font-headline tracking-tight">
            {greeting}
          </h2>
          <p className="text-on-surface-muted text-[10px] uppercase tracking-widest">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {variant === "landlord" && (
          <button className="w-10 h-10 rounded-full bg-surface-4 flex items-center justify-center border border-white/5">
            <MaterialIcon name="settings" className="text-sm" />
          </button>
        )}
        <button className="w-10 h-10 rounded-full bg-surface-4 flex items-center justify-center border border-white/5 relative">
          <MaterialIcon name="notifications" className="text-sm" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 ml-1">
          <img alt="Profile" className="w-full h-full object-cover" src={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
