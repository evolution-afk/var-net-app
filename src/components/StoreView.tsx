import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, Globe2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { StoreCategory } from "../types";
import { formatNumber } from "../utils/format";
import { SegmentedControl } from "./SegmentedControl";

export interface Product {
  id: number;
  type: StoreCategory;
  name: string;
  price_toman: number;
  metadata: {
    quota_gb?: number;
    duration_months?: number;
    type?: string;
  };
}

interface StoreViewProps {
  onBuy: (product: Product) => void;
  processingProductId: number | null;
}

export function StoreView({ onBuy, processingProductId }: StoreViewProps) {
  const [category, setCategory] = useState<StoreCategory>("vpn");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Products request failed (${response.status})`);
        }
        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Products response was not an array");
        }
        setProducts(data as Product[]);
        setError(null);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load products");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <section className="page-section" aria-label="فروشگاه">
      <div className="store-hero">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span className="live-dot" /> سرویس‌های دیجیتال، ساده‌تر از همیشه</span>
          <h1>دسترسی آزاد،<br /><em>با خیال راحت.</em></h1>
          <p>آی‌پی ثابت و اشتراک هوش مصنوعی را با چند لمس تهیه کن.</p>
          <div className="hero-promise"><ShieldCheck size={16} /> پرداخت امن با کیف پول ور نت</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-globe"><Globe2 size={76} strokeWidth={1.1} /></div>
          <div className="hero-float-card"><span><Zap size={14} /></span><strong>اتصال پایدار</strong><small>همیشه در دسترس</small></div>
          <span className="hero-spark hero-spark-a">✦</span>
          <span className="hero-spark hero-spark-b">✧</span>
        </div>
        <div className="hero-index"><span>۰۱</span><span className="hero-index-line" /><span>۰۲</span></div>
      </div>

      <div className="section-heading store-heading">
        <div>
          <span className="eyebrow">انتخاب سرویس</span>
          <h2>از کجا شروع کنیم؟</h2>
          <p>سرویس مناسب خودت را انتخاب کن.</p>
        </div>
        <SegmentedControl
          label="دسته‌بندی فروشگاه"
          onChange={(value) => setCategory(value as StoreCategory)}
          options={[
            { value: "vpn", label: "VPN", Icon: Globe2 },
            { value: "ai", label: "حساب هوش مصنوعی", Icon: Sparkles },
          ]}
          value={category}
        />
      </div>

      <div className="product-grid" key={category}>
        {isLoading ? (
          <p role="status">در حال بارگذاری محصولات…</p>
        ) : error ? (
          <p role="alert">بارگذاری محصولات ناموفق بود. {error}</p>
        ) : products.filter((product) => product.type === category).length === 0 ? (
          <p>در این دسته‌بندی محصول فعالی وجود ندارد.</p>
        ) : (
          products
            .filter((product) => product.type === category)
            .map((product) =>
              product.type === "vpn" ? (
                <VpnProductCard key={product.id} product={product} onBuy={onBuy} processing={processingProductId === product.id} disabled={processingProductId !== null} />
              ) : (
                <AiProductCard key={product.id} product={product} onBuy={onBuy} processing={processingProductId === product.id} disabled={processingProductId !== null} />
              ),
            )
        )}
      </div>

      <div className="support-strip">
        <span className="support-icon"><ShieldCheck size={18} /></span>
        <p><strong>برای انتخاب مطمئن‌تر، کنار شما هستیم.</strong><small>پشتیبانی ور نت هر روز از ساعت ۹ تا ۲۱ پاسخ‌گوست.</small></p>
        <button aria-label="اطلاعات بیشتر درباره پشتیبانی" type="button"><ArrowLeft size={17} /></button>
      </div>
    </section>
  );
}

function VpnProductCard({
  product,
  onBuy,
  processing,
  disabled,
}: {
  product: Product;
  onBuy: (product: Product) => void;
  processing: boolean;
  disabled: boolean;
}) {
  const quota = product.metadata.quota_gb;
  const duration = product.metadata.duration_months;

  return (
    <article className="product-card vpn-product">
      <div className="product-card-top">
        <span className="product-icon vpn-icon"><Globe2 size={22} /></span>
        <span className="country-bubble" aria-label="آلمان">🇩🇪</span>
      </div>
      <div className="product-title-block">
        <span className="product-kicker">VPN • آی‌پی ثابت</span>
        <h3>{product.name}</h3>
        <p>مناسب استفاده روزمره</p>
      </div>
      <div className="product-specs">
        <div><span className="spec-icon"><Zap size={15} /></span><span><small>حجم</small><strong>{quota ? `${formatNumber(quota)} گیگابایت` : "نامحدود"}</strong></span></div>
        <div><span className="spec-icon"><Clock3 size={15} /></span><span><small>مدت اعتبار</small><strong>{duration ? `${formatNumber(duration)} ماهه` : "—"}</strong></span></div>
      </div>
      <div className="product-card-footer">
        <div className="product-price"><strong>{formatNumber(product.price_toman)}</strong><small>تومان</small></div>
        <button className="button-primary buy-button" disabled={disabled} onClick={() => onBuy(product)} type="button">
          {processing ? "در حال ثبت…" : <>خرید با کیف پول <ArrowLeft size={16} /></>}
        </button>
      </div>
    </article>
  );
}

function AiProductCard({
  product,
  onBuy,
  processing,
  disabled,
}: {
  product: Product;
  onBuy: (product: Product) => void;
  processing: boolean;
  disabled: boolean;
}) {
  const isShared = product.metadata.type === "shared";
  const accent = product.name.toLowerCase().includes("claude") ? "violet" : "green";

  return (
    <article className="product-card ai-product">
      <div className="product-card-top">
        <span className={`product-icon ai-icon ${accent}`}><Sparkles size={21} /></span>
        <span className={`plan-badge ${isShared ? "shared" : "private"}`}>{isShared ? "اشتراکی" : "اختصاصی"}</span>
      </div>
      <div className="product-title-block">
        <span className="product-kicker">اشتراک هوش مصنوعی</span>
        <h3>{product.name}</h3>
        <p>دسترسی به مدل‌های پیشرفته و ابزارها</p>
      </div>
      <div className="ai-feature-list">
        <span><Check size={14} /> تحویل سریع و مطمئن</span>
        <span><Check size={14} /> یک ماهه</span>
      </div>
      <div className="product-card-footer">
        <div className="product-price"><strong>{formatNumber(product.price_toman)}</strong><small>تومان</small></div>
        <button className="button-primary buy-button" disabled={disabled} onClick={() => onBuy(product)} type="button">
          {processing ? "در حال ثبت…" : <>خرید با کیف پول <ArrowLeft size={16} /></>}
        </button>
      </div>
      <span className={`card-accent ${accent}`} />
    </article>
  );
}
