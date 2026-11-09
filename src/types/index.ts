export type MainTab = "store" | "dashboard" | "wallet";
export type StoreCategory = "vpn" | "ai";
export type DashboardCategory = "vpn" | "ai";

export interface VpnPlan {
  id: string;
  name: string;
  quota: string;
  duration: string;
  price: number;
  subtitle: string;
  popular?: boolean;
}

export interface AiPlan {
  id: string;
  service: string;
  planType: "اشتراکی" | "اختصاصی";
  duration: string;
  price: number;
  description: string;
  accent: "green" | "violet";
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: "success" | "pending";
}

export interface ToastMessage {
  id: number;
  title: string;
  tone: "success" | "info";
}
