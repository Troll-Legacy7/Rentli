import { cn } from "@/lib/utils";
import { MaterialIcon } from "./icon";

interface DesktopTopBarProps {
  title: string;
  avatarUrl: string;
  className?: string;
}

export function DesktopTopBar({ title, avatarUrl, className }: DesktopTopBarProps) {
  return (
    <header
      className={cn(
        "flex justify-between items-center h-20 px-8 sticky top-0 bg-surface-1/60 backdrop-blur-3xl z-40",
        className
      )}
    >
      <div className="flex items-center gap-6 flex-1">
        <h2 className="font-headline font-semibold text-lg text-primary">{title}</h2>
        <div className="relative w-full max-w-md">
          <MaterialIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"
          />
          <input
            type="text"
            placeholder="Search analytics..."
            className="w-full bg-surface-0 border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-secondary-text">
          <button className="hover:opacity-80 transition-opacity">
            <MaterialIcon name="notifications" />
          </button>
          <button className="hover:opacity-80 transition-opacity">
            <MaterialIcon name="help_outline" />
          </button>
        </div>
        <button className="bg-surface-bright text-secondary-text px-5 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity active:scale-[0.98]">
          Download Report
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-3 border-2 border-primary/20">
          <img alt="Profile" className="h-full w-full object-cover" src={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
