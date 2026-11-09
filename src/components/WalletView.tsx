import { useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowUpLeft, Check, Clock3, Copy, CreditCard, Info, Plus, Wallet } from "lucide-react";
import { useUser } from "../context/UserContext";
import { transactions } from "../mockData";
import type { Transaction } from "../types";
import { formatNumber, formatToman } from "../utils/format";

interface WalletViewProps {
  onNotify: (title: string, tone?: "success" | "info") => void;
}

export function WalletView({ onNotify }: WalletViewProps) {
  const { walletBalance, isLoading, error } = useUser();
  const [receiptId, setReceiptId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (receiptId.trim().length < 6) return;
    setSubmitted(true);
    setReceiptId("");
    onNotify("درخواست افزایش موجودی برای بررسی ثبت شد.");
  }

  async function copyCardNumber() {
    try {
      await navigator.clipboard.writeText("6037990000004218");
      onNotify("شماره کارت نمونه کپی شد.", "info");
    } catch {
      onNotify("کپی خودکار در این مرورگر فعال نیست.", "info");
    }
  }

  return (
    <section className="page-section" aria-label="کیف پول">
      <div className="page-title-row wallet-title-row">
        <div><span className="eyebrow">اعتبار و پرداخت</span><h1>کیف پول</h1><p>موجودی‌ات را مدیریت و گردش حساب را دنبال کن.</p></div>
      </div>

      {error && <p role="alert">دریافت موجودی کیف پول ناموفق بود. لطفاً صفحه را دوباره بارگذاری کنید.</p>}

      <div className="wallet-layout">
        <div className="wallet-main-column">
          <section className="wallet-balance-card">
            <div className="wallet-card-glow" />
            <div className="wallet-balance-top"><span><Wallet size={17} /> موجودی قابل استفاده</span><span className="wallet-card-mark">VAR <i>NET</i></span></div>
            <strong className="wallet-amount">{isLoading ? "…" : error ? "—" : formatNumber(walletBalance)}<small>تومان</small></strong>
            <div className="wallet-card-bottom"><span>حساب کاربری ور نت</span><span>•••• ۲۰۴۸</span></div>
          </section>

          <section className="wallet-panel topup-panel">
            <div className="panel-title-row"><span className="panel-icon blue"><Plus size={19} /></span><div><h2>افزایش موجودی</h2><p>رسید پرداخت را ثبت کن تا شارژ حساب بررسی شود.</p></div></div>
            <div className="bank-card-row">
              <span className="bank-icon"><CreditCard size={19} /></span>
              <div><small>شماره کارت مقصد <b>• نمونه نمایشی</b></small><strong dir="ltr">۶۰۳۷ &nbsp;•••• &nbsp;•••• &nbsp;۴۲۱۸</strong></div>
              <button aria-label="کپی شماره کارت نمونه" className="icon-button copy-card-button" onClick={copyCardNumber} type="button"><Copy size={16} /></button>
            </div>
            <form className="topup-form" onSubmit={submitTopUp}>
              <label htmlFor="receipt-id">شماره پیگیری / شناسه رسید</label>
              <div className="input-wrap"><input autoComplete="off" id="receipt-id" inputMode="numeric" maxLength={32} onChange={(event) => { setReceiptId(event.target.value); setSubmitted(false); }} placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰" value={receiptId} /><span className="input-suffix"><CreditCard size={16} /></span></div>
              <button className="button-primary submit-topup" disabled={receiptId.trim().length < 6} type="submit">ثبت درخواست شارژ <ArrowLeft size={16} /></button>
              {submitted && <p className="form-success"><Check size={15} /> درخواست ثبت شد و پس از بررسی به موجودی اضافه می‌شود.</p>}
            </form>
            <div className="manual-review-note"><Info size={15} /><span>تأیید پرداخت به‌صورت دستی انجام می‌شود. این نسخه به درگاه بانکی متصل نیست.</span></div>
          </section>
        </div>

        <section className="wallet-panel history-panel">
          <div className="history-heading"><div><h2>تراکنش‌های اخیر</h2><p>آخرین تغییرات کیف پول</p></div><button aria-label="نمایش همه تراکنش‌ها" className="history-more" type="button"><ArrowLeft size={17} /></button></div>
          <div className="transaction-list">{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</div>
          <button className="all-transactions" onClick={() => onNotify("در نسخه نهایی، همه تراکنش‌ها اینجا نمایش داده می‌شوند.", "info")} type="button">مشاهده همه تراکنش‌ها <ArrowLeft size={15} /></button>
        </section>
      </div>
    </section>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.amount > 0;
  const isPending = transaction.status === "pending";

  return (
    <article className="transaction-row">
      <span className={`transaction-icon ${isCredit ? "credit" : "debit"}`}>{isCredit ? <ArrowDownLeft size={17} /> : <ArrowUpLeft size={17} />}</span>
      <div className="transaction-copy"><strong>{transaction.title}</strong><small>{transaction.date}</small><span className={`transaction-status ${isPending ? "pending" : "complete"}`}>{isPending ? <Clock3 size={12} /> : <Check size={12} />}{isPending ? "در انتظار بررسی" : "تکمیل‌شده"}</span></div>
      <strong className={`transaction-amount ${isCredit ? "positive" : "negative"}`}>{isCredit ? "+" : "−"}{formatToman(Math.abs(transaction.amount)).replace(" تومان", "")}</strong>
    </article>
  );
}
