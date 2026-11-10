export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const initData = window.Telegram?.WebApp.initData;
  if (initData) {
    headers.set("Authorization", `tma ${initData}`);
  }

  return fetch(input, { ...init, headers });
}
