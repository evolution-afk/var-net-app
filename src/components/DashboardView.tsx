import { useEffect, useState } from "react";
import { ArrowLeft, Check, Download, Globe2, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import type { DashboardCategory } from "../types";
import { formatNumber } from "../utils/format";
import { SegmentedControl } from "./SegmentedControl";

interface DashboardViewProps {
  onNotify: (title: string, tone?: "success" | "info") => void;
}

interface PurchasedService {
  order_id: number;
  created_at: string;
  type: DashboardCategory;
  name: string;
  metadata: {
    quota_gb?: number;
    duration_months?: number;
    type?: string;
  };
}

const countries = [
  { code: "de", name: "آلمان", flag: "🇩🇪" },
  { code: "us", name: "آمریکا", flag: "🇺🇸" },
  { code: "nl", name: "هلند", flag: "🇳🇱" },
];

export function DashboardView({ onNotify }: DashboardViewProps) {
  const [category, setCategory] = useState<DashboardCategory>("vpn");
  const [services, setServices] = useState<PurchasedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        const response = await fetch("/api/dashboard/my", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Services request failed (${response.status})`);
        }
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isPurchasedService)) {
          throw new Error("Services response was invalid");
        }
        setServices(data);
        setError(null);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load services");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadServices();
    return () => controller.abort();
  }, []);

  const myVpns = services.filter((service) => service.type === "vpn");
  const myAis = services.filter((service) => service.type === "ai");
  const visibleServices = category === "vpn" ? myVpns : myAis;

  return (
    <section className="page-section" aria-label="سرویس‌های من">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">فضای کاربری شما</span>
          <h1>سرویس‌های من</h1>
          <p>وضعیت و دسترسی سرویس‌هایت را یک‌جا ببین.</p>
        </div>
        <span className="service-count">
          <span className="live-dot" />
          {isLoading ? "در حال بارگذاری" : error ? "وضعیت نامشخص" : `${formatNumber(services.length)} سرویس خریداری‌شده`}
        </span>
      </div>

      <div className="dashboard-toolbar">
        <SegmentedControl
          label="فیلتر سرویس‌های من"
          onChange={(value) => setCategory(value as DashboardCategory)}
          options={[
            { value: "vpn", label: "VPN های من", Icon: Wifi },
            { value: "ai", label: "حساب‌های AI", Icon: Sparkles },
          ]}
          value={category}
        />
        <span className="last-updated">آخرین بروزرسانی: همین الان</span>
      </div>

      <div className="dashboard-list" key={category}>
        {isLoading ? (
          <div className="service-card dashboard-empty" role="status">در حال بارگذاری سرویس‌ها…</div>
        ) : error ? (
          <div className="service-card dashboard-empty" role="alert">بارگذاری سرویس‌ها ناموفق بود. {error}</div>
        ) : visibleServices.length === 0 ? (
          <div className="service-card dashboard-empty" role="status">
            <ShieldCheck size={24} />
            <strong>{services.length === 0 ? "هنوز سرویسی خریداری نکرده‌اید." : "در این دسته‌بندی سرویسی ندارید."}</strong>
            <span>پس از خرید، سرویس شما در این بخش نمایش داده می‌شود.</span>
          </div>
        ) : category === "vpn" ? (
          myVpns.map((service) => <MyVpnCard key={service.order_id} service={service} onNotify={onNotify} />)
        ) : (
          myAis.map((service) => <MyAiCard key={service.order_id} service={service} onNotify={onNotify} />)
        )}
      </div>

      <div className="help-card">
        <span className="help-card-icon"><ShieldCheck size={19} /></span>
        <div><strong>سؤالی درباره سرویس داری؟</strong><small>تیم پشتیبانی برای راهنمایی در دسترس است.</small></div>
        <button className="icon-button" aria-label="رفتن به پشتیبانی" type="button"><ArrowLeft size={17} /></button>
      </div>
    </section>
  );
}

function MyVpnCard({ service, onNotify }: { service: PurchasedService; onNotify: DashboardViewProps["onNotify"] }) {
  const quota = service.metadata.quota_gb;
  const duration = service.metadata.duration_months;
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadConfig() {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        orderId: String(service.order_id),
        serverCode: "de",
      });
      const response = await fetch(`/api/vpn/config?${params.toString()}`);
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "دریافت فایل اتصال ناموفق بود.";
        throw new Error(message);
      }

      if (
        typeof result !== "object" ||
        result === null ||
        !("success" in result) ||
        result.success !== true ||
        !("ovpnContent" in result) ||
        typeof result.ovpnContent !== "string"
      ) {
        throw new Error("پاسخ فایل اتصال معتبر نیست.");
      }

      const blob = new Blob([result.ovpnContent], { type: "application/x-openvpn-profile" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "VarNet-Germany.ovpn";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      onNotify("فایل اتصال آلمان دانلود شد.");
    } catch (requestError) {
      onNotify(
        requestError instanceof Error ? requestError.message : "دریافت فایل اتصال ناموفق بود.",
        "info",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <article className="service-card vpn-service-card">
      <div className="service-card-heading">
        <span className="service-logo vpn-icon"><Globe2 size={21} /></span>
        <div className="service-heading-copy"><span className="product-kicker">VPN • آی‌پی ثابت</span><h2>{service.name}</h2></div>
        <span className="status-pill active"><span className="status-dot" /> خریداری‌شده</span>
      </div>

      <div className="service-meta-row">
        <span><small>تاریخ خرید</small><strong>{formatOrderDate(service.created_at)}</strong></span>
        <span><small>حجم پلن</small><strong>{quota ? `${formatNumber(quota)} گیگابایت` : "—"}</strong></span>
        <span><small>مدت پلن</small><strong>{duration ? `${formatNumber(duration)} ماه` : "—"}</strong></span>
      </div>

      <div className="config-section">
        <div className="config-heading"><div><strong>فایل اتصال کشورها</strong><small>فایل را دانلود و در اپلیکیشن VPN وارد کن.</small></div><span className="file-label">.OVPN</span></div>
        <div className="country-grid">
          {countries.map((country) => (
            <button
              className="country-button"
              disabled={country.code !== "de" || isDownloading}
              key={country.code}
              onClick={() => {
                if (country.code === "de") void downloadConfig();
              }}
              type="button"
            >
              <span className="country-flag">{country.flag}</span>
              <span className="country-name">{country.code === "de" && isDownloading ? "در حال آماده‌سازی…" : country.name}</span>
              {country.code === "de" && <Download size={15} />}
            </button>
          ))}
        </div>
        <p className="demo-note">دانلود فایل اتصال به‌زودی فعال می‌شود.</p>
      </div>
      <ServiceCardFooter orderId={service.order_id} onNotify={onNotify} />
    </article>
  );
}

function MyAiCard({ service, onNotify }: { service: PurchasedService; onNotify: DashboardViewProps["onNotify"] }) {
  const isShared = service.metadata.type === "shared";
  const duration = service.metadata.duration_months;

  return (
    <article className="service-card ai-service-card">
      <div className="service-card-heading">
        <span className="service-logo ai-icon green"><Sparkles size={21} /></span>
        <div className="service-heading-copy"><span className="product-kicker">اشتراک هوش مصنوعی</span><h2>{service.name}</h2></div>
        <span className="status-pill active"><span className="status-dot" /> خریداری‌شده</span>
      </div>

      <div className="service-meta-row ai-meta-row">
        <span><small>تاریخ خرید</small><strong>{formatOrderDate(service.created_at)}</strong></span>
        <span><small>نوع دسترسی</small><strong>{isShared ? "اشتراکی" : service.metadata.type ? "اختصاصی" : "—"}</strong></span>
      </div>

      <div className="credential-panel">
        <div className="credential-header"><span className="credential-icon"><Sparkles size={16} /></span><div><strong>جزئیات اشتراک</strong><small>اطلاعات دسترسی پس از آماده‌سازی سرویس نمایش داده می‌شود.</small></div></div>
        <div className="service-meta-row ai-meta-row">
          <span><small>مدت پلن</small><strong>{duration ? `${formatNumber(duration)} ماه` : "—"}</strong></span>
          <span><small>وضعیت سفارش</small><strong>تکمیل‌شده</strong></span>
        </div>
      </div>

      <ServiceCardFooter orderId={service.order_id} onNotify={onNotify} />
    </article>
  );
}

function ServiceCardFooter({ orderId, onNotify }: { orderId: number; onNotify: DashboardViewProps["onNotify"] }) {
  return (
    <div className="service-card-footer">
      <span><Check size={15} /> سفارش #{formatNumber(orderId)}</span>
      <button type="button" onClick={() => onNotify("اطلاعات سرویس به‌روز است.", "info")}>جزئیات سرویس <ArrowLeft size={15} /></button>
    </div>
  );
}

function isPurchasedService(value: unknown): value is PurchasedService {
  if (typeof value !== "object" || value === null) return false;
  if (
    !("order_id" in value) ||
    typeof value.order_id !== "number" ||
    !("created_at" in value) ||
    typeof value.created_at !== "string" ||
    !("type" in value) ||
    (value.type !== "vpn" && value.type !== "ai") ||
    !("name" in value) ||
    typeof value.name !== "string" ||
    !("metadata" in value) ||
    typeof value.metadata !== "object" ||
    value.metadata === null
  ) {
    return false;
  }
  const metadata = value.metadata;
  if (
    ("quota_gb" in metadata && (typeof metadata.quota_gb !== "number" || !Number.isFinite(metadata.quota_gb))) ||
    ("duration_months" in metadata &&
      (typeof metadata.duration_months !== "number" || !Number.isFinite(metadata.duration_months))) ||
    ("type" in metadata && typeof metadata.type !== "string")
  ) {
    return false;
  }
  return true;
}

function formatOrderDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fa-IR").format(date);
}
