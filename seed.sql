INSERT INTO products (type, name, price_toman, metadata, is_active)
SELECT 'vpn', 'VPN One Month', 89000, '{"quota_gb":20,"duration_months":1}', 1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE type = 'vpn' AND name = 'VPN One Month'
);

INSERT INTO products (type, name, price_toman, metadata, is_active)
SELECT 'vpn', 'VPN Three Months', 229000, '{"quota_gb":50,"duration_months":3}', 1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE type = 'vpn' AND name = 'VPN Three Months'
);

INSERT INTO products (type, name, price_toman, metadata, is_active)
SELECT 'ai', 'ChatGPT Plus', 329000, '{"type":"shared"}', 1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE type = 'ai' AND name = 'ChatGPT Plus'
);

INSERT INTO products (type, name, price_toman, metadata, is_active)
SELECT 'ai', 'Claude Pro', 449000, '{"type":"dedicated"}', 1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE type = 'ai' AND name = 'Claude Pro'
);
