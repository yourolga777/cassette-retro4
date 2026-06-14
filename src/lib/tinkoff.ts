import { createHash } from "crypto";

function getConfig() {
  const TINKOFF_API = process.env.TINKOFF_API_URL;
  const TERMINAL_KEY = process.env.TINKOFF_TERMINAL_KEY;
  const PASSWORD = process.env.TINKOFF_PASSWORD || "";
  if (!TINKOFF_API) throw new Error("TINKOFF_API_URL не задан в .env");
  if (!TERMINAL_KEY) throw new Error("TINKOFF_TERMINAL_KEY не задан в .env");
  return { TINKOFF_API, TERMINAL_KEY, PASSWORD };
}

interface TinkoffPaymentParams {
  amount: number;
  orderId: string;
  customerKey: string;
  email: string;
  phone: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

function generateToken(data: Record<string, unknown>, password: string): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  const values = Object.values(sorted)
    .map((v) => String(v))
    .join("");

  return createHash("sha256").update(values + password).digest("hex");
}

interface TinkoffInitResponse {
  Success: boolean;
  ErrorCode?: string;
  Message?: string;
  PaymentURL?: string;
  PaymentId?: string;
  OrderId?: string;
  Status?: string;
}

export async function initPayment(
  params: TinkoffPaymentParams
): Promise<TinkoffInitResponse> {
  const { TINKOFF_API, TERMINAL_KEY, PASSWORD } = getConfig();

  const receiptItems = params.items.map((item) => ({
    Name: item.name,
    Price: item.price,
    Quantity: item.quantity,
    Amount: item.price * item.quantity,
    Tax: "none",
  }));

  const payload: Record<string, unknown> = {
    TerminalKey: TERMINAL_KEY,
    Amount: params.amount,
    OrderId: params.orderId,
    Description: `Оплата заказа ${params.orderId}`,
    CustomerKey: params.customerKey,
    DATA: {
      Email: params.email,
      Phone: params.phone,
    },
    Receipt: {
      Email: params.email,
      Phone: params.phone,
      Taxation: "usn_income",
      Items: receiptItems,
    },
    SuccessURL: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    FailURL: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?error=true`,
  };

  payload.Token = generateToken(payload, PASSWORD);

  const response = await fetch(`${TINKOFF_API}/Init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function checkPaymentStatus(paymentId: string) {
  const { TINKOFF_API, TERMINAL_KEY, PASSWORD } = getConfig();
  const payload: Record<string, unknown> = {
    TerminalKey: TERMINAL_KEY,
    PaymentId: paymentId,
  };

  payload.Token = generateToken(payload, PASSWORD);

  const response = await fetch(`${TINKOFF_API}/GetState`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export function verifyWebhook(data: Record<string, unknown>): boolean {
  const { PASSWORD } = getConfig();
  const { Token, ...rest } = data;
  const expectedToken = generateToken(rest, PASSWORD);
  return Token === expectedToken;
}
