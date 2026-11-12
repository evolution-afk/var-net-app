interface PagesFunctionContext {
  request: Request;
  next(): Promise<Response>;
}

const allowedOrigins = new Set([
  "https://varnet.kdns.fr",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8788",
  "http://127.0.0.1:8788",
]);

function createCorsHeaders(origin: string): Headers {
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  });
}

export async function onRequest({ request, next }: PagesFunctionContext): Promise<Response> {
  const origin = request.headers.get("Origin");
  if (request.method === "OPTIONS") {
    if (origin === null || !allowedOrigins.has(origin)) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: createCorsHeaders(origin) });
  }

  const response = await next();
  if (origin === null || !allowedOrigins.has(origin)) {
    return response;
  }

  const headers = new Headers(response.headers);
  const vary = headers.get("Vary");
  if (vary === null || !vary.split(",").some((value) => value.trim().toLowerCase() === "origin")) {
    headers.set("Vary", vary === null ? "Origin" : `${vary}, Origin`);
  }
  createCorsHeaders(origin).forEach((value, name) => headers.set(name, value));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
