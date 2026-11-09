import { useEffect, useState } from "react";
import { ArrowLeft, CircleCheck, ShieldCheck, X } from "lucide-react";
import { DashboardView } from "./components/DashboardView";
import { StoreView } from "./components/StoreView";
import { WalletView } from "./components/WalletView";
import { AppLayout } from "./layouts/AppLayout";
import { walletBalance } from "./mockData";
import type { MainTab, ToastMessage } from "./types";
import { formatToman } from "./utils/format";

interface PurchaseIntent {
  name: string;
  price: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>("store");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("varnet-theme") === "dark");
  const [purchase, setPurchase] = useState<PurchaseIntent | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("varnet-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!purchase) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPurchase(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [purchase]);

  function notify(title: string, tone: ToastMessage["tone"] = "success") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, title, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }

  function confirmPreviewPurchase() {
    setPurchase(null);
    notify("این دمو به درگاه پرداخت متصل نیست؛ سفارشی ثبت نشد.", "info");
  }

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        balance={walletBalance}
        isDark={isDark}
        onOpenWallet={() => setActiveTab("wallet")}
        onTabChange={setActiveTab}
        onToggleTheme={() => setIsDark((value) => !value)}
      >
        {activeTab === "store" && <StoreView onBuy={(name, price) => setPurchase({ name, price })} />}
        {activeTab === "dashboard" && <DashboardView onNotify={notify} />}
        {activeTab === "wallet" && <WalletView balance={walletBalance} onNotify={notify} />}
      </AppLayout>

      {purchase && (
        <div className="modal-backdrop" onClick={() => setPurchase(null)} role="presentation">
          <section aria-labelledby="purchase-title" aria-modal="true" className="purchase-modal" onClick={(event) => event.stopPropagation()} role="dialog">
            <button aria-label="بستن پنجره" className="modal-close" onClick={() => setPurchase(null)} type="button"><X size={18} /></button>
            <span className="modal-illustration"><ShieldCheck size={24} /></span>
            <span className="eyebrow">پیش‌نمایش سفارش</span>
            <h2 id="purchase-title">خرید {purchase.name}</h2>
            <p>مبلغ سفارش از موجودی کیف پول کسر می‌شود.</p>
            <div className="modal-price-line"><span>مبلغ قابل پرداخت</span><strong>{formatToman(purchase.price)}</strong></div>
            <div className="modal-balance-line"><span>موجودی فعلی</span><strong>{formatToman(walletBalance)}</strong></div>
            <div className="modal-demo-note"><CircleCheck size={15} /> پرداخت در این نسخه فقط نمایشی است.</div>
            <div className="modal-actions"><button className="button-secondary" onClick={() => setPurchase(null)} type="button">انصراف</button><button className="button-primary" onClick={confirmPreviewPurchase} type="button">ادامه <ArrowLeft size={16} /></button></div>
          </section>
        </div>
      )}

      <div aria-live="polite" className="toast-stack">
        {toasts.map((toast) => <div className={`toast-card ${toast.tone}`} key={toast.id}><span>{toast.tone === "success" ? <CircleCheck size={18} /> : <ShieldCheck size={18} />}</span><p>{toast.title}</p><button aria-label="بستن پیام" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} type="button"><X size={15} /></button></div>)}
      </div>
    </>
  );
}
