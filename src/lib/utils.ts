import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(kopecks: number): string {
  const rubles = (kopecks / 100).toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return rubles;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORDER-${ts}-${rand}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    blank: "Пустые кассеты",
    recorded: "С записями",
    equipment: "Оборудование",
  };
  return labels[category] || category;
}

export function getPostTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    original: "Моя статья",
    saved: "Из интернета",
  };
  return labels[type] || type;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.charAt(0);
  return `${visible}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  const prefix = digits.slice(0, digits.length - 4);
  const suffix = digits.slice(-2);
  return `${prefix}***${suffix}`;
}
