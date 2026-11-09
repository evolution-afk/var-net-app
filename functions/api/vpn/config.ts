import { getUserFromRequest } from "../_shared/auth";

interface ProductRow {
  type: string;
  metadata: string;
}

interface SubscriptionRow {
  radius_username: string;
  radius_password: string;
}

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
  VAR_API_URL?: string;
  VAR_API_TOKEN?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: Environment;
}

const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateCredential(): string {
  const maxByte = 256 - (256 % TOKEN_ALPHABET.length);
  let credential = "";

  while (credential.length < 6) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < maxByte) credential += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
      if (credential.length === 6) break;
    }
  }

  return credential;
}

function isLocalRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function makeOvpnContent(serverCode: string, username: string, password: string): string {
  return [
    "client",
    "dev tun",
    "proto udp",
    `remote ${serverCode}.vpn.example.invalid 1194`,
    "resolv-retry infinite",
    "nobind",
    "persist-key",
    "persist-tun",
    "remote-cert-tls server",
    "<auth-user-pass>",
    username,
    password,
    "</auth-user-pass>",
    "",
  ].join("\n");
}

export async function onRequestGet({ request, env }: PagesFunctionContext): Promise<Response> {
  const userId = getUserFromRequest(request, env);
  if (userId === null) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const orderIdValue = url.searchParams.get("orderId");
  const serverCode = url.searchParams.get("serverCode");
  if (
    orderIdValue === null ||
    !/^[1-9]\d*$/.test(orderIdValue) ||
    !Number.isSafeInteger(Number(orderIdValue)) ||
    serverCode === null
  ) {
    return Response.json({ error: "Valid orderId and serverCode are required" }, { status: 400 });
  }

  if (serverCode !== "de") {
    return Response.json({ error: "This VPN server is not available yet" }, { status: 400 });
  }

  const orderId = Number(orderIdValue);
  const order = await env.DB
    .prepare(
      `SELECT p.type, p.metadata
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.id = ?1 AND o.user_id = ?2 AND o.status = 'completed'`,
    )
    .bind(orderId, userId)
    .first<ProductRow>();

  if (order === null || order.type !== "vpn") {
    return Response.json({ error: "Completed VPN order not found" }, { status: 404 });
  }

  let metadata: unknown;
  try {
    metadata = JSON.parse(order.metadata);
  } catch {
    throw new Error(`Invalid product metadata for VPN order ${orderId}`);
  }

  if (
    typeof metadata !== "object" ||
    metadata === null ||
    !("quota_gb" in metadata) ||
    typeof metadata.quota_gb !== "number" ||
    !Number.isFinite(metadata.quota_gb) ||
    metadata.quota_gb < 0
  ) {
    throw new Error(`Missing or invalid VPN quota for order ${orderId}`);
  }

  let subscription = await env.DB
    .prepare(
      `SELECT radius_username, radius_password
       FROM vpn_subscriptions
       WHERE order_id = ?1 AND server_code = ?2`,
    )
    .bind(orderId, serverCode)
    .first<SubscriptionRow>();

  if (subscription === null) {
    const username = generateCredential();
    const password = generateCredential();

    if (env.VAR_API_URL === undefined) {
      if (!isLocalRequest(request)) {
        return Response.json({ error: "VPN provisioning is not configured" }, { status: 503 });
      }
    } else {
      if (env.VAR_API_TOKEN === undefined || env.VAR_API_TOKEN.length === 0) {
        return Response.json({ error: "VPN provisioning is not configured" }, { status: 503 });
      }

      let bridgeUrl: URL;
      try {
        bridgeUrl = new URL("/api/radius/create", env.VAR_API_URL);
        if (bridgeUrl.protocol !== "https:" && !isLocalRequest(request)) {
          return Response.json({ error: "VPN provisioning endpoint must use HTTPS" }, { status: 503 });
        }
      } catch {
        return Response.json({ error: "VPN provisioning endpoint is invalid" }, { status: 503 });
      }

      try {
        const bridgeResponse = await fetch(bridgeUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.VAR_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, quotaGb: metadata.quota_gb }),
        });

        if (!bridgeResponse.ok) {
          return Response.json({ error: "VPN account could not be provisioned" }, { status: 502 });
        }
      } catch {
        return Response.json({ error: "VPN provisioning service is unavailable" }, { status: 502 });
      }
    }

    const durationMonths =
      "duration_months" in metadata &&
      typeof metadata.duration_months === "number" &&
      Number.isFinite(metadata.duration_months) &&
      metadata.duration_months > 0
        ? metadata.duration_months
        : 1;
    const expiryDate = new Date();
    expiryDate.setUTCMonth(expiryDate.getUTCMonth() + durationMonths);

    await env.DB
      .prepare(
        `INSERT INTO vpn_subscriptions
         (order_id, radius_username, radius_password, server_code, expiry_date, quota_limit_gb)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
      .bind(orderId, username, password, serverCode, expiryDate.toISOString(), metadata.quota_gb)
      .run();

    subscription = { radius_username: username, radius_password: password };
  }

  const { radius_username: username, radius_password: password } = subscription;
  return Response.json(
    {
      success: true,
      username,
      password,
      ovpnContent: makeOvpnContent(serverCode, username, password),
    },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
