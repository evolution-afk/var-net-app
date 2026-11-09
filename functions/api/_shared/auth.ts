interface Environment {
  DB: unknown;
}

const LOCAL_MOCK_TELEGRAM_ID = "111222333";

export function getUserFromRequest(request: Request, _env: Environment): string | null {
  const url = new URL(request.url);
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";

  if (!isLocal) return null;

  const mockId = request.headers.get("X-Mock-Telegram-Id");
  if (mockId === null) return LOCAL_MOCK_TELEGRAM_ID;

  if (!/^[1-9]\d*$/.test(mockId) || !Number.isSafeInteger(Number(mockId))) {
    return null;
  }

  return mockId;
}
