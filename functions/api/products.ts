interface ProductRow {
  id: number;
  type: "vpn" | "ai";
  name: string;
  price_toman: number;
  metadata: string;
  is_active: number;
}

interface D1Database {
  prepare(query: string): {
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface Environment {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Environment }): Promise<Response> {
  const { results } = await env.DB
    .prepare("SELECT * FROM products WHERE is_active = 1")
    .all<ProductRow>();
  const products = results.map((product) => ({
    ...product,
    metadata: JSON.parse(product.metadata),
  }));

  return Response.json(products);
}
