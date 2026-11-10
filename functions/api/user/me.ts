import { getUserFromRequest } from "../_shared/auth";

interface WalletRow {
  balance_toman: number;
}

interface D1Statement {
  bind(...values: string[]): D1Statement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
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

export async function onRequest({ request, env }: PagesFunctionContext): Promise<Response> {
  const userId = await getUserFromRequest(request, env);
  if (userId === null) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  await env.DB
    .prepare("INSERT INTO users (id, role) VALUES (?1, 'user') ON CONFLICT(id) DO NOTHING")
    .bind(userId)
    .run();

  await env.DB
    .prepare("INSERT INTO wallets (user_id, balance_toman) VALUES (?1, 0) ON CONFLICT(user_id) DO NOTHING")
    .bind(userId)
    .run();

  const wallet = await env.DB
    .prepare("SELECT balance_toman FROM wallets WHERE user_id = ?1")
    .bind(userId)
    .first<WalletRow>();

  if (wallet === null) {
    throw new Error(`Wallet initialization failed for user ${userId}`);
  }

  return Response.json({
    telegramId: userId,
    walletBalance: wallet.balance_toman,
  });
}
