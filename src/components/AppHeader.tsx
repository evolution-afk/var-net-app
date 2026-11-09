import { ArrowDownLeft, ChevronDown, ShieldCheck } from "lucide-react";
import { formatToman } from "../utils/format";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  balance: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWallet: () => void;
}

export function AppHeader({ balance, isDark, onToggleTheme, onOpenWallet }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-lockup" aria-label="ور نت">
        <span className="brand-mark">
          <ShieldCheck size={23} strokeWidth={2.3} />
        </span>
        <span className="brand-copy">
          <strong>ور نت</strong>
          <small>VAR NET</small>
        </span>
      </div>

      <div className="header-actions">
        <button className="balance-chip" onClick={onOpenWallet} type="button">
          <span className="balance-chip-icon"><ArrowDownLeft size={15} /></span>
          <span className="balance-chip-copy">
            <small>موجودی کیف پول</small>
            <strong>{formatToman(balance)}</strong>
          </span>
          <ChevronDown className="balance-chevron" size={14} />
        </button>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
