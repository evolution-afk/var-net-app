import { useState } from "react";
import { ArrowLeft, Check, Copy, Download, KeyRound, ShieldCheck, Sparkles, Users, Wifi } from "lucide-react";
import type { DashboardCategory } from "../types";
import { SegmentedControl } from "./SegmentedControl";

interface DashboardViewProps {
  onNotify: (title: string, tone?: "success" | "info") => void;
}

const countries = [
  { code: "de", name: "آلمان", flag: "🇩🇪" },
  { code: "us", name: "آمریکا", flag: "🇺🇸" },
  { code: "nl", name: "هلند", flag: "🇳🇱" },
];

export function DashboardView({ onNotify }: DashboardViewProps) {
  const [category, setCategory] = useState<DashboardCategory>("vpn");

  return (
    <section className="page-section" aria-label="سرویس‌های من">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">فضای کاربری شما</span>
          <h1>سرویس‌های من</h1>
          <p>وضعیت و دسترسی سرویس‌هایت را یک‌جا ببین.</p>
        </div>
        <span className="service-count"><span className="live-dot" /> ۲ سرویس فعال</span>
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
        {category === "vpn" ? <MyVpnCard onNotify={onNotify} /> : <MyAiCard onNotify={onNotify} />}
      </div>

      <div className="help-card">
        <span className="help-card-icon"><ShieldCheck size={19} /></span>
        <div><strong>سؤالی درباره سرویس داری؟</strong><small>تیم پشتیبانی برای راهنمایی در دسترس است.</small></div>
        <button className="icon-button" aria-label="رفتن به پشتیبانی" type="button"><ArrowLeft size={17} /></button>
      </div>
    </section>
  );
}

function MyVpnCard({ onNotify }: DashboardViewProps) {
  return (
    <article className="service-card vpn-service-card">
      <div className="service-card-heading">
        <span className="service-logo vpn-icon"><Globe2Icon /></span>
        <div className="service-heading-copy"><span className="product-kicker">VPN • آی‌پی ثابت</span><h2>آی‌پی ثابت آلمان</h2></div>
        <span className="status-pill active"><span className="status-dot" /> فعال</span>
      </div>

      <div className="service-meta-row">
        <span><small>تاریخ انقضا</small><strong>۶ آذر ۱۴۰۵</strong></span>
        <span><small>روزهای باقی‌مانده</small><strong>۱۸ روز</strong></span>
        <span><small>موقعیت اتصال</small><strong>فرانکفورت، DE</strong></span>
      </div>

      <div className="usage-panel">
        <div className="usage-heading"><span>مصرف اینترنت</span><strong>۱۲ <small>/ ۲۰ گیگابایت</small></strong></div>
        <div aria-label="۶۰ درصد مصرف شده" className="usage-track" role="progressbar" aria-valuemin={0} aria-valuemax={20} aria-valuenow={12}>
          <span className="usage-fill" />
        </div>
        <div className="usage-footnote"><span>۸ گیگابایت باقی‌مانده</span><span>۶۰٪ مصرف شده</span></div>
      </div>

      <div className="config-section">
        <div className="config-heading"><div><strong>فایل اتصال کشورها</strong><small>فایل را دانلود و در اپلیکیشن VPN وارد کن.</small></div><span className="file-label">.OVPN</span></div>
        <div className="country-grid">
          {countries.map((country) => (
            <button
              className="country-button"
              key={country.code}
              onClick={() => downloadOvpn(country.name, country.code, onNotify)}
              type="button"
            >
              <span className="country-flag">{country.flag}</span>
              <span className="country-name">{country.name}</span>
              <Download size={15} />
            </button>
          ))}
        </div>
        <p className="demo-note">فایل‌های دانلودی در این نسخه نمونه هستند و اتصال واقعی ایجاد نمی‌کنند.</p>
      </div>
    </article>
  );
}

function MyAiCard({ onNotify }: DashboardViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      onNotify("اطلاعات ورود کپی شد.");
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      onNotify("کپی خودکار در این مرورگر فعال نیست.", "info");
    }
  }

  return (
    <article className="service-card ai-service-card">
      <div className="service-card-heading">
        <span className="service-logo ai-icon green"><Sparkles size={21} /></span>
        <div className="service-heading-copy"><span className="product-kicker">اشتراک اختصاصی</span><h2>ChatGPT Plus</h2></div>
        <span className="status-pill active"><span className="status-dot" /> فعال</span>
      </div>

      <div className="service-meta-row ai-meta-row">
        <span><small>تاریخ انقضا</small><strong>۲۶ آذر ۱۴۰۵</strong></span>
        <span><small>نوع دسترسی</small><strong>حساب اختصاصی</strong></span>
      </div>

      <div className="credential-panel">
        <div className="credential-header"><span className="credential-icon"><KeyRound size={16} /></span><div><strong>اطلاعات ورود</strong><small>این اطلاعات را محرمانه نگه دار.</small></div><span className="private-tag"><Users size={13} /> خصوصی</span></div>
        <CredentialField label="ایمیل" value="user.demo@varnet.app" copied={copiedField === "email"} onCopy={() => copyValue("email", "user.demo@varnet.app")} />
        <CredentialField label="رمز عبور" value="••••••••••••" copied={copiedField === "password"} onCopy={() => copyValue("password", "Demo-Password-Only")} />
      </div>

      <div className="service-card-footer"><span><Check size={15} /> اطلاعات حساب آخرین بار امروز بررسی شد.</span><button type="button" onClick={() => onNotify("اطلاعات سرویس به‌روز است.", "info")}>جزئیات سرویس <ArrowLeft size={15} /></button></div>
    </article>
  );
}

function CredentialField({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="credential-field">
      <span className="credential-label">{label}</span>
      <code dir="ltr">{value}</code>
      <button aria-label={`کپی ${label}`} onClick={onCopy} type="button">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
    </div>
  );
}

function downloadOvpn(country: string, code: string, onNotify: DashboardViewProps["onNotify"]) {
  const contents = `# Var Net demo profile for ${country}\n# Demo only: replace with a provisioned VPN profile before use.\nclient\ndev tun\nproto udp\nremote ${code}.vpn.example.invalid 1194\nresolv-retry infinite\nnobind\npersist-key\npersist-tun\n`;
  const url = URL.createObjectURL(new Blob([contents], { type: "application/x-openvpn-profile" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `varnet-${code}-demo.ovpn`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  onNotify(`فایل نمونه ${country} دانلود شد.`, "info");
}

function Globe2Icon() {
  return <Wifi size={21} />;
}
