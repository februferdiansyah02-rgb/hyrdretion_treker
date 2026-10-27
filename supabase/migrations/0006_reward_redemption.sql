BEGIN;

-- Riwayat penukaran sekaligus voucher simulasi.
CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id BIGINT NOT NULL
    REFERENCES public.reward_catalog(id),
  reward_name TEXT NOT NULL,
  points_spent INTEGER NOT NULL CHECK (points_spent > 0),
  voucher_code UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  request_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Pengulangan request yang sama tidak memotong poin lagi.
  UNIQUE (user_id, request_id)
);

CREATE INDEX reward_redemptions_user_history
  ON public.reward_redemptions(user_id, created_at DESC);

ALTER TABLE public.reward_redemptions
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.reward_redemptions
  FROM anon, authenticated;

GRANT SELECT ON public.reward_redemptions
  TO authenticated;

CREATE POLICY reward_redemptions_read
  ON public.reward_redemptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Harga dan identitas pengguna diambil dari database.
-- request_id dibuat frontend untuk satu percobaan penukaran.
CREATE FUNCTION public.redeem_reward(
  p_reward_id BIGINT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
  wallet public.reward_wallets%ROWTYPE;
  reward public.reward_catalog%ROWTYPE;
  redemption public.reward_redemptions%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Silakan login terlebih dahulu.'
      USING ERRCODE = '28000';
  END IF;

  IF p_reward_id IS NULL OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Data penukaran tidak lengkap.';
  END IF;

  INSERT INTO public.reward_wallets(user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  -- Penukaran dan check-in memakai kunci saldo yang sama.
  SELECT * INTO wallet
  FROM public.reward_wallets
  WHERE user_id = uid
  FOR UPDATE;

  -- Jika request pernah berhasil, kembalikan voucher sebelumnya.
  SELECT * INTO redemption
  FROM public.reward_redemptions
  WHERE user_id = uid
    AND request_id = p_request_id;

  IF FOUND THEN
    IF redemption.reward_id <> p_reward_id THEN
      RAISE EXCEPTION 'ID request sudah dipakai untuk hadiah lain.';
    END IF;

    RETURN jsonb_build_object(
      'redeemed', FALSE,
      'alreadyProcessed', TRUE,
      'balance', wallet.balance,
      'voucher', to_jsonb(redemption)
    );
  END IF;

  -- Kunci stok agar tidak diperebutkan dua pengguna.
  SELECT * INTO reward
  FROM public.reward_catalog
  WHERE id = p_reward_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hadiah tidak ditemukan.';
  END IF;

  IF NOT reward.active THEN
    RAISE EXCEPTION 'Hadiah sedang tidak tersedia.';
  END IF;

  IF reward.stock <= 0 THEN
    RAISE EXCEPTION 'Stok hadiah sudah habis.';
  END IF;

  IF wallet.balance < reward.points_cost THEN
    RAISE EXCEPTION 'Poin belum cukup untuk hadiah ini.';
  END IF;

  UPDATE public.reward_wallets
  SET balance = balance - reward.points_cost
  WHERE user_id = uid
  RETURNING * INTO wallet;

  UPDATE public.reward_catalog
  SET stock = stock - 1
  WHERE id = reward.id;

  INSERT INTO public.reward_redemptions (
    user_id,
    reward_id,
    reward_name,
    points_spent,
    request_id
  )
  VALUES (
    uid,
    reward.id,
    reward.name,
    reward.points_cost,
    p_request_id
  )
  RETURNING * INTO redemption;

  RETURN jsonb_build_object(
    'redeemed', TRUE,
    'alreadyProcessed', FALSE,
    'balance', wallet.balance,
    'voucher', to_jsonb(redemption)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_reward(BIGINT, UUID)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.redeem_reward(BIGINT, UUID)
  TO authenticated;

COMMIT;