import type { AiPlan, Transaction, VpnPlan } from "../types";

export const walletBalance = 150_000;

export const vpnPlans: VpnPlan[] = [
  {
    id: "vpn-20",
    name: "آی‌پی ثابت آلمان",
    quota: "۲۰ گیگابایت",
    duration: "۳۰ روزه",
    price: 89_000,
    subtitle: "مناسب استفاده روزمره",
  },
  {
    id: "vpn-50",
    name: "آی‌پی ثابت ویژه",
    quota: "۵۰ گیگابایت",
    duration: "۳۰ روزه",
    price: 149_000,
    subtitle: "سرعت و پایداری بیشتر",
    popular: true,
  },
  {
    id: "vpn-100",
    name: "آی‌پی ثابت حرفه‌ای",
    quota: "۱۰۰ گیگابایت",
    duration: "۶۰ روزه",
    price: 259_000,
    subtitle: "برای کار و استفاده سنگین",
  },
];

export const aiPlans: AiPlan[] = [
  {
    id: "chatgpt-plus",
    service: "ChatGPT Plus",
    planType: "اشتراکی",
    duration: "یک ماهه",
    price: 329_000,
    description: "دسترسی به مدل‌های پیشرفته و ابزارها",
    accent: "green",
  },
  {
    id: "claude-pro",
    service: "Claude Pro",
    planType: "اختصاصی",
    duration: "یک ماهه",
    price: 449_000,
    description: "حساب اختصاصی با فضای کاری مستقل",
    accent: "violet",
  },
  {
    id: "chatgpt-team",
    service: "ChatGPT Team",
    planType: "اختصاصی",
    duration: "یک ماهه",
    price: 599_000,
    description: "فضای کاری اختصاصی برای تیم شما",
    accent: "green",
  },
];

export const transactions: Transaction[] = [
  {
    id: "txn-1",
    title: "خرید آی‌پی ثابت آلمان",
    date: "امروز، ۱۴:۳۲",
    amount: -89_000,
    status: "success",
  },
  {
    id: "txn-2",
    title: "درخواست افزایش موجودی",
    date: "دیروز، ۱۹:۰۸",
    amount: 100_000,
    status: "pending",
  },
  {
    id: "txn-3",
    title: "خرید اشتراک ChatGPT Plus",
    date: "۲۲ آبان، ۱۱:۴۵",
    amount: -329_000,
    status: "success",
  },
];
