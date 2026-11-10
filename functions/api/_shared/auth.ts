interface Environment {
  DB: {
    prepare(query: string): {
      bind(...values: string[]): {
        run(): Promise<unknown>;
      };
    };
  };
  TELEGRAM_BOT_TOKEN?: string;
  ADMIN_TELEGRAM_ID?: string;
}

interface TelegramUser {
  id: number;
}

const LOCAL_MOCK_TELEGRAM_ID = "111222333";
const textEncoder = new TextEncoder();

async function getTelegramUser(initData: string, botToken: string): Promise<TelegramUser | null> {
  const params = new URLSearchParams(initData);
  const hashes = params.getAll("hash");
  if (hashes.length !== 1 || !/^[a-f\d]{64}$/i.test(hashes[0])) return null;

  const fields = [...params.entries()].filter(([key]) => key !== "hash");
  if (new Set(fields.map(([key]) => key)).size !== fields.length) return null;
  const dataCheckString = fields
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const appSecretKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secretKeyBytes = await crypto.subtle.sign("HMAC", appSecretKey, textEncoder.encode(botToken));
  const secretKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signature = Uint8Array.from(
    hashes[0].match(/.{2}/g) ?? [],
    (byte) => Number.parseInt(byte, 16),
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    secretKey,
    signature,
    textEncoder.encode(dataCheckString),
  );
  if (!isValid) return null;

  const userValues = params.getAll("user");
  if (userValues.length !== 1) return null;

  let user: unknown;
  try {
    user = JSON.parse(userValues[0]);
  } catch {
    return null;
  }
  if (
    typeof user !== "object" ||
    user === null ||
    !("id" in user) ||
    typeof user.id !== "number" ||
    !Number.isSafeInteger(user.id) ||
    user.id <= 0
  ) {
    return null;
  }

  return { id: user.id };
}

export async function getUserFromRequest(request: Request, env: Environment): Promise<string | null> {
  const authorization = request.headers.get("Authorization");
  let userId: string;

  if (authorization === null) {
    if (env.TELEGRAM_BOT_TOKEN !== undefined && env.TELEGRAM_BOT_TOKEN.length > 0) return null;
    userId = LOCAL_MOCK_TELEGRAM_ID;
  } else {
    const match = /^tma (.+)$/.exec(authorization);
    if (match === null || env.TELEGRAM_BOT_TOKEN === undefined || env.TELEGRAM_BOT_TOKEN.length === 0) {
      return null;
    }

    const user = await getTelegramUser(match[1], env.TELEGRAM_BOT_TOKEN);
    if (user === null) return null;
    userId = String(user.id);
  }

  const role = userId === env.ADMIN_TELEGRAM_ID ? "admin" : "user";
  await env.DB
    .prepare(
      `INSERT INTO users (id, role) VALUES (?1, ?2)
       ON CONFLICT(id) DO UPDATE SET role = excluded.role`,
    )
    .bind(userId, role)
    .run();
  await env.DB
    .prepare("INSERT INTO wallets (user_id, balance_toman) VALUES (?1, 0) ON CONFLICT(user_id) DO NOTHING")
    .bind(userId)
    .run();

  return userId;
}
