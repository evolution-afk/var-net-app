import { getUserFromRequest } from "../_shared/auth";

interface D1Statement {
  bind(...values: (number | string)[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface Environment {
  DB: D1Database;
}

interface PagesFunctionContext {
  request: Request;
  env: Environment;
}

interface OrderRow {
  type: string;
}

export async function onRequestGet({ request, env }: PagesFunctionContext): Promise<Response> {
  const userId = await getUserFromRequest(request, env);
  if (userId === null) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const orderIdValue = new URL(request.url).searchParams.get("orderId");
  if (
    orderIdValue === null ||
    !/^[1-9]\d*$/.test(orderIdValue) ||
    !Number.isSafeInteger(Number(orderIdValue))
  ) {
    return Response.json({ error: "A valid orderId is required" }, { status: 400 });
  }

  const order = await env.DB
    .prepare(
      `SELECT p.type
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.id = ?1 AND o.user_id = ?2 AND o.status = 'completed'`,
    )
    .bind(Number(orderIdValue), userId)
    .first<OrderRow>();

  if (order === null || order.type !== "ai") {
    return Response.json({ error: "Completed AI order not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    email: "premium-user@nobull.com",
    password: "AiSecurePassword2026",
    licenseKey: "AI-XXXX-YYYY-ZZZZ",
  });
}
