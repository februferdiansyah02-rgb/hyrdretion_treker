BEGIN;

-- Katalog makanan/minuman yang bisa ditukar.
CREATE TABLE public.reward_catalog (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL
    CHECK (category IN ('food', 'drink')),
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pengguna boleh melihat hadiah aktif.
-- Harga dan stok tidak boleh diubah langsung oleh pengguna.
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.reward_catalog FROM anon, authenticated;

GRANT SELECT ON public.reward_catalog TO authenticated;

CREATE POLICY reward_catalog_read
  ON public.reward_catalog
  FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- Contoh hadiah untuk simulasi tugas.
INSERT INTO public.reward_catalog (
  name,
  description,
  category,
  points_cost,
  stock
)
VALUES
  (
    'Air Mineral',
    'Voucher simulasi satu botol air mineral 600 ml.',
    'drink',
    100,
    50
  ),
  (
    'Roti Gandum',
    'Voucher simulasi satu porsi roti gandum.',
    'food',
    150,
    30
  ),
  (
    'Salad Buah',
    'Voucher simulasi satu cup salad buah.',
    'food',
    200,
    25
  ),
  (
    'Jus Jeruk',
    'Voucher simulasi satu gelas jus jeruk.',
    'drink',
    300,
    20
  );

COMMIT;