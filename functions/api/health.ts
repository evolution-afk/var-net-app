export function onRequest(): Response {
  return new Response(
    JSON.stringify({ ok: true, message: "Var Net API is running" }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}
