-- Inventory service schema (Inventory context)

CREATE TABLE IF NOT EXISTS inventory_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL UNIQUE,
    quantity    INTEGER NOT NULL,
    reserved    INTEGER NOT NULL DEFAULT 0,
    version     BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_items(product_id);
