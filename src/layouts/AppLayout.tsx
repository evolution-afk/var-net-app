import type { ReactNode } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomNavigation } from "../components/BottomNavigation";
import type { MainTab } from "../types";

interface AppLayoutProps {
  activeTab: MainTab;
  balance: number;
  isDark: boolean;
  onTabChange: (tab: MainTab) => void;
  onToggleTheme: () => void;
  onOpenWallet: () => void;
  children: ReactNode;
}

export function AppLayout({
  activeTab,
  balance,
  isDark,
  onTabChange,
  onToggleTheme,
  onOpenWallet,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-frame min-h-screen bg-[var(--bg)] text-[var(--text)] dark:bg-[var(--bg)] dark:text-[var(--text)]">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <AppHeader balance={balance} isDark={isDark} onOpenWallet={onOpenWallet} onToggleTheme={onToggleTheme} />
      <main className="main-content" id="main-content">{children}</main>
      <BottomNavigation activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
