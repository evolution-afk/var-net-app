import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      aria-label={isDark ? "فعال کردن تم روشن" : "فعال کردن تم تیره"}
      aria-pressed={isDark}
      className="theme-toggle"
      onClick={onToggle}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
