const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = (
  configuredApiBaseUrl || (import.meta.env.PROD ? "https://api-var.popserver.shop" : "")
).replace(/\/+$/, "");

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const initData = window.Telegram?.WebApp.initData;
  if (initData) {
    headers.set("Authorization", `tma ${initData}`);
  }

  let requestUrl: RequestInfo | URL = input;
  if (apiBaseUrl) {
    const inputUrl = input instanceof Request ? input.url : input.toString();
    const localUrl = new URL(inputUrl, window.location.origin);
    if (localUrl.origin === window.location.origin && localUrl.pathname.startsWith("/api/")) {
      const apiUrl = new URL(
        `${localUrl.pathname}${localUrl.search}${localUrl.hash}`,
        `${apiBaseUrl}/`,
      );
      requestUrl = input instanceof Request ? new Request(apiUrl, input) : apiUrl;
    }
  }

  return fetch(requestUrl, { ...init, headers });
}
