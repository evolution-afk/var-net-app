import { useEffect, useState } from "react";
import { ArrowLeft, CircleCheck, ShieldCheck, X } from "lucide-react";
import { DashboardView } from "./components/DashboardView";
import { StoreView, type Product } from "./components/StoreView";
import { WalletView } from "./components/WalletView";
import { useUser } from "./context/UserContext";
import { AppLayout } from "./layouts/AppLayout";
import type { MainTab, ToastMessage } from "./types";
import { formatToman } from "./utils/format";

interface PurchaseIntent {
  product: Product;
}

export default function App() {
  const { walletBalance, setWalletBalance, setUser, setLoading, setError, isLoading, error } = useUser();
  const [activeTab, setActiveTab] = useState<MainTab>("store");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("varnet-theme") === "dark");
  const [purchase, setPurchase] = useState<PurchaseIntent | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("varnet-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch("/api/user/me", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`User request failed (${response.status})`);
        }
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("telegramId" in data) ||
          typeof data.telegramId !== "string" ||
          !("walletBalance" in data) ||
          typeof data.walletBalance !== "number" ||
          !Number.isFinite(data.walletBalance)
        ) {
          throw new Error("User response was invalid");
        }
        setUser(data.telegramId, data.walletBalance);
        setError(null);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        const message = requestError instanceof Error ? requestError.message : "Unable to load user";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadUser();
    return () => controller.abort();
  }, [setError, setLoading, setUser]);

  useEffect(() => {
    if (!purchase) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPurchasing) setPurchase(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [purchase, isPurchasing]);

  function notify(title: string, tone: ToastMessage["tone"] = "success") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, title, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }

  async function confirmPurchase() {
    if (!purchase || isPurchasing) return;

    setIsPurchasing(true);
    setProcessingProductId(purchase.product.id);
    setPurchaseError(null);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: purchase.product.id }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const apiError =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "ثبت سفارش ناموفق بود.";
        throw new Error(apiError === "Insufficient funds" ? "موجودی کیف پول برای این خرید کافی نیست." : apiError);
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("success" in data) ||
        data.success !== true ||
        !("walletBalance" in data) ||
        typeof data.walletBalance !== "number" ||
        !Number.isFinite(data.walletBalance)
      ) {
        throw new Error("پاسخ ثبت سفارش معتبر نیست.");
      }

      setWalletBalance(data.walletBalance);
      setPurchase(null);
      notify("سفارش با موفقیت ثبت شد.");
    } catch (requestError) {
      setPurchaseError(requestError instanceof Error ? requestError.message : "ثبت سفارش ناموفق بود.");
    } finally {
      setIsPurchasing(false);
      setProcessingProductId(null);
    }
  }

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        isDark={isDark}
        onOpenWallet={() => setActiveTab("wallet")}
        onTabChange={setActiveTab}
        onToggleTheme={() => setIsDark((value) => !value)}
      >
        {activeTab === "store" && (
          <StoreView
            onBuy={(product) => {
              setPurchaseError(null);
              setPurchase({ product });
            }}
            processingProductId={processingProductId}
          />
        )}
        {activeTab === "dashboard" && <DashboardView onNotify={notify} />}
        {activeTab === "wallet" && <WalletView onNotify={notify} />}
      </AppLayout>

      {error && <span className="sr-only" role="alert">بارگذاری اطلاعات کاربر ناموفق بود.</span>}

      {purchase && (
        <div className="modal-backdrop" onClick={() => { if (!isPurchasing) setPurchase(null); }} role="presentation">
          <section aria-labelledby="purchase-title" aria-modal="true" className="purchase-modal" onClick={(event) => event.stopPropagation()} role="dialog">
            <button aria-label="بستن پنجره" className="modal-close" disabled={isPurchasing} onClick={() => setPurchase(null)} type="button"><X size={18} /></button>
            <span className="modal-illustration"><ShieldCheck size={24} /></span>
            <span className="eyebrow">پیش‌نمایش سفارش</span>
            <h2 id="purchase-title">خرید {purchase.product.name}</h2>
            <p>مبلغ سفارش از موجودی کیف پول کسر می‌شود.</p>
            <div className="modal-price-line"><span>مبلغ قابل پرداخت</span><strong>{formatToman(purchase.product.price_toman)}</strong></div>
            <div className="modal-balance-line"><span>موجودی فعلی</span><strong>{isLoading ? "…" : formatToman(walletBalance)}</strong></div>
            <div className="modal-demo-note"><CircleCheck size={15} /> مبلغ از موجودی کیف پول کسر خواهد شد.</div>
            {purchaseError && <p role="alert">{purchaseError}</p>}
            <div className="modal-actions"><button className="button-secondary" disabled={isPurchasing} onClick={() => setPurchase(null)} type="button">انصراف</button><button className="button-primary" disabled={isPurchasing || isLoading || Boolean(error)} onClick={() => void confirmPurchase()} type="button">{isPurchasing ? "در حال ثبت…" : <>ادامه <ArrowLeft size={16} /></>}</button></div>
          </section>
        </div>
      )}

      <div aria-live="polite" className="toast-stack">
        {toasts.map((toast) => <div className={`toast-card ${toast.tone}`} key={toast.id}><span>{toast.tone === "success" ? <CircleCheck size={18} /> : <ShieldCheck size={18} />}</span><p>{toast.title}</p><button aria-label="بستن پیام" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} type="button"><X size={15} /></button></div>)}
      </div>
    </>
  );
}
