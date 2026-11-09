import { getUserFromRequest } from "../_shared/auth";

interface DashboardOrderRow {
  order_id: number;
  created_at: string;
  type: "vpn" | "ai";
  name: string;
  metadata: string;
}

interface D1Database {
  prepare(query: string): {
    bind(...values: string[]): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface Environment {
  DB: D1Database;
}

interface PagesFunctionContext {
  request: Request;
  env: Environment;
}

export async function onRequestGet({ request, env }: PagesFunctionContext): Promise<Response> {
  const userId = getUserFromRequest(request, env);
  if (userId === null) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { results } = await env.DB
    .prepare(
      `SELECT o.id as order_id, o.created_at, p.type, p.name, p.metadata
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?1 AND o.status = 'completed'
       ORDER BY o.created_at DESC`,
    )
    .bind(userId)
    .all<DashboardOrderRow>();

  const orders = results.map((order) => ({
    ...order,
    metadata: JSON.parse(order.metadata),
  }));

  return Response.json(orders);
}
