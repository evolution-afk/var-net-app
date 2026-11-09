import { LayoutDashboard, Store, Wallet } from "lucide-react";
import type { MainTab } from "../types";

interface BottomNavigationProps {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
}

const items: { id: MainTab; label: string; Icon: typeof Store }[] = [
  { id: "store", label: "فروشگاه", Icon: Store },
  { id: "dashboard", label: "سرویس‌های من", Icon: LayoutDashboard },
  { id: "wallet", label: "کیف پول", Icon: Wallet },
];

export function BottomNavigation({ activeTab, onChange }: BottomNavigationProps) {
  return (
    <nav aria-label="منوی اصلی" className="bottom-nav">
      {items.map(({ id, label, Icon }) => (
        <button
          aria-current={activeTab === id ? "page" : undefined}
          className={`nav-item ${activeTab === id ? "is-active" : ""}`}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          <span className="nav-icon"><Icon size={19} strokeWidth={2} /></span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
