import { getUserFromRequest } from "../_shared/auth";

interface ProductRow {
  price_toman: number;
}

interface WalletRow {
  balance_toman: number;
}

interface D1Result {
  meta: {
    changes: number;
  };
}

interface D1Statement {
  bind(...values: (number | string)[]): D1Statement;
  first<T>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}

interface Environment {
  DB: D1Database;
}

interface PagesFunctionContext {
  request: Request;
  env: Environment;
}

export async function onRequestPost({ request, env }: PagesFunctionContext): Promise<Response> {
  const userId = getUserFromRequest(request, env);
  if (userId === null) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("productId" in body) ||
    typeof body.productId !== "number" ||
    !Number.isSafeInteger(body.productId) ||
    body.productId <= 0
  ) {
    return Response.json({ error: "A valid productId is required" }, { status: 400 });
  }

  const productId = body.productId;
  const product = await env.DB
    .prepare("SELECT price_toman FROM products WHERE id = ?1 AND is_active = 1")
    .bind(productId)
    .first<ProductRow>();

  if (product === null) {
    return Response.json({ error: "Product not found or inactive" }, { status: 404 });
  }

  const wallet = await env.DB
    .prepare("SELECT balance_toman FROM wallets WHERE user_id = ?1")
    .bind(userId)
    .first<WalletRow>();

  if (wallet === null) {
    return Response.json({ error: "Wallet not found" }, { status: 404 });
  }

  if (wallet.balance_toman < product.price_toman) {
    return Response.json({ error: "Insufficient funds" }, { status: 400 });
  }

  const transactionReference = crypto.randomUUID();
  const description = `Purchase product ${productId} (${transactionReference})`;
  const results = await env.DB.batch([
    env.DB
      .prepare(
        `INSERT INTO wallet_transactions (user_id, amount, type, description)
         SELECT ?1, -?2, 'purchase', ?3
         WHERE EXISTS (
           SELECT 1 FROM products WHERE id = ?4 AND is_active = 1 AND price_toman = ?2
         )
         AND EXISTS (
           SELECT 1 FROM wallets WHERE user_id = ?1 AND balance_toman >= ?2
         )`,
      )
      .bind(userId, product.price_toman, description, productId),
    env.DB
      .prepare(
        `UPDATE wallets
         SET balance_toman = balance_toman - ?1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?2
           AND balance_toman >= ?1
           AND EXISTS (
             SELECT 1 FROM wallet_transactions
             WHERE user_id = ?2 AND type = 'purchase' AND amount = -?1 AND description = ?3
           )`,
      )
      .bind(product.price_toman, userId, description),
    env.DB
      .prepare(
        `INSERT INTO orders (user_id, product_id, amount, status)
         SELECT ?1, ?2, ?3, 'completed'
         WHERE EXISTS (
           SELECT 1 FROM wallet_transactions
           WHERE user_id = ?1 AND type = 'purchase' AND amount = -?3 AND description = ?4
         )`,
      )
      .bind(userId, productId, product.price_toman, description),
  ]);

  if (results[0]?.meta.changes !== 1 || results[1]?.meta.changes !== 1 || results[2]?.meta.changes !== 1) {
    const [currentProduct, currentWallet] = await Promise.all([
      env.DB
        .prepare("SELECT price_toman FROM products WHERE id = ?1 AND is_active = 1")
        .bind(productId)
        .first<ProductRow>(),
      env.DB
        .prepare("SELECT balance_toman FROM wallets WHERE user_id = ?1")
        .bind(userId)
        .first<WalletRow>(),
    ]);

    if (currentProduct === null) {
      return Response.json({ error: "Product not found or inactive" }, { status: 404 });
    }
    if (currentWallet === null || currentWallet.balance_toman < currentProduct.price_toman) {
      return Response.json({ error: "Insufficient funds" }, { status: 400 });
    }
    return Response.json({ error: "Order could not be completed; please retry" }, { status: 409 });
  }

  const updatedWallet = await env.DB
    .prepare("SELECT balance_toman FROM wallets WHERE user_id = ?1")
    .bind(userId)
    .first<WalletRow>();

  if (updatedWallet === null) {
    throw new Error(`Wallet disappeared after purchase for user ${userId}`);
  }

  return Response.json({
    success: true,
    walletBalance: updatedWallet.balance_toman,
  });
}
