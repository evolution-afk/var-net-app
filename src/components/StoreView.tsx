import { useState } from "react";
import { ArrowLeft, Check, Clock3, Globe2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { aiPlans, vpnPlans } from "../mockData";
import type { AiPlan, StoreCategory, VpnPlan } from "../types";
import { formatNumber } from "../utils/format";
import { SegmentedControl } from "./SegmentedControl";

interface StoreViewProps {
  onBuy: (name: string, price: number) => void;
}

export function StoreView({ onBuy }: StoreViewProps) {
  const [category, setCategory] = useState<StoreCategory>("vpn");

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
        {category === "vpn"
          ? vpnPlans.map((plan) => <VpnProductCard key={plan.id} plan={plan} onBuy={onBuy} />)
          : aiPlans.map((plan) => <AiProductCard key={plan.id} plan={plan} onBuy={onBuy} />)}
      </div>

      <div className="support-strip">
        <span className="support-icon"><ShieldCheck size={18} /></span>
        <p><strong>برای انتخاب مطمئن‌تر، کنار شما هستیم.</strong><small>پشتیبانی ور نت هر روز از ساعت ۹ تا ۲۱ پاسخ‌گوست.</small></p>
        <button aria-label="اطلاعات بیشتر درباره پشتیبانی" type="button"><ArrowLeft size={17} /></button>
      </div>
    </section>
  );
}

function VpnProductCard({ plan, onBuy }: { plan: VpnPlan; onBuy: (name: string, price: number) => void }) {
  return (
    <article className={`product-card vpn-product ${plan.popular ? "is-popular" : ""}`}>
      {plan.popular && <span className="popular-ribbon"><Sparkles size={13} /> محبوب کاربران</span>}
      <div className="product-card-top">
        <span className="product-icon vpn-icon"><Globe2 size={22} /></span>
        <span className="country-bubble" aria-label="آلمان">🇩🇪</span>
      </div>
      <div className="product-title-block">
        <span className="product-kicker">VPN • آی‌پی ثابت</span>
        <h3>{plan.name}</h3>
        <p>{plan.subtitle}</p>
      </div>
      <div className="product-specs">
        <div><span className="spec-icon"><Zap size={15} /></span><span><small>حجم</small><strong>{plan.quota}</strong></span></div>
        <div><span className="spec-icon"><Clock3 size={15} /></span><span><small>مدت اعتبار</small><strong>{plan.duration}</strong></span></div>
      </div>
      <div className="product-card-footer">
        <div className="product-price"><strong>{formatNumber(plan.price)}</strong><small>تومان</small></div>
        <button className="button-primary buy-button" onClick={() => onBuy(plan.name, plan.price)} type="button">
          خرید با کیف پول <ArrowLeft size={16} />
        </button>
      </div>
    </article>
  );
}

function AiProductCard({ plan, onBuy }: { plan: AiPlan; onBuy: (name: string, price: number) => void }) {
  return (
    <article className="product-card ai-product">
      <div className="product-card-top">
        <span className={`product-icon ai-icon ${plan.accent}`}><Sparkles size={21} /></span>
        <span className={`plan-badge ${plan.planType === "اختصاصی" ? "private" : "shared"}`}>{plan.planType}</span>
      </div>
      <div className="product-title-block">
        <span className="product-kicker">اشتراک هوش مصنوعی</span>
        <h3>{plan.service}</h3>
        <p>{plan.description}</p>
      </div>
      <div className="ai-feature-list">
        <span><Check size={14} /> تحویل سریع و مطمئن</span>
        <span><Check size={14} /> {plan.duration}</span>
      </div>
      <div className="product-card-footer">
        <div className="product-price"><strong>{formatNumber(plan.price)}</strong><small>تومان</small></div>
        <button className="button-primary buy-button" onClick={() => onBuy(plan.service, plan.price)} type="button">
          خرید با کیف پول <ArrowLeft size={16} />
        </button>
      </div>
      <span className={`card-accent ${plan.accent}`} />
    </article>
  );
}
