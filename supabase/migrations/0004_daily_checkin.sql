BEGIN;

-- Saldo poin dan streak setiap pengguna.
CREATE TABLE public.reward_wallets (
  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_checkin DATE
);

-- Riwayat poin yang diperoleh pengguna.
CREATE TABLE public.reward_ledger (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  kind TEXT NOT NULL
    CHECK (kind IN ('daily_checkin', 'streak_bonus')),
  points INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_date, kind)
);

CREATE INDEX reward_ledger_user_history
  ON public.reward_ledger(user_id, id DESC);

-- Pengguna hanya boleh membaca data miliknya.
-- Penambahan poin harus melalui fungsi database.
ALTER TABLE public.reward_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.reward_wallets, public.reward_ledger
  FROM anon, authenticated;

GRANT SELECT ON public.reward_wallets, public.reward_ledger
  TO authenticated;

CREATE POLICY reward_wallet_read
  ON public.reward_wallets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY reward_ledger_read
  ON public.reward_ledger
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Check-in: +10 poin; bonus +30 setiap streak kelipatan 7.
CREATE FUNCTION public.claim_daily_checkin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := (
    statement_timestamp() AT TIME ZONE 'Asia/Jakarta'
  )::DATE;
  wallet public.reward_wallets%ROWTYPE;
  next_streak INTEGER;
  bonus INTEGER;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Login diperlukan'
      USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.reward_wallets(user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  -- Kunci saldo agar request bersamaan tidak memberi poin dobel.
  SELECT * INTO wallet
  FROM public.reward_wallets
  WHERE user_id = uid
  FOR UPDATE;

  IF wallet.last_checkin >= today THEN
    RETURN jsonb_build_object(
      'claimed', FALSE,
      'pointsEarned', 0,
      'balance', wallet.balance,
      'streak', wallet.streak,
      'lastCheckin', wallet.last_checkin,
      'today', today
    );
  END IF;

  next_streak := CASE
    WHEN wallet.last_checkin = today - 1
      THEN wallet.streak + 1
    ELSE 1
  END;

  bonus := CASE
    WHEN next_streak % 7 = 0 THEN 30
    ELSE 0
  END;

  INSERT INTO public.reward_ledger(
    user_id, event_date, kind, points
  )
  VALUES (uid, today, 'daily_checkin', 10);

  IF bonus > 0 THEN
    INSERT INTO public.reward_ledger(
      user_id, event_date, kind, points
    )
    VALUES (uid, today, 'streak_bonus', bonus);
  END IF;

  UPDATE public.reward_wallets
  SET
    balance = balance + 10 + bonus,
    streak = next_streak,
    last_checkin = today
  WHERE user_id = uid
  RETURNING * INTO wallet;

  RETURN jsonb_build_object(
    'claimed', TRUE,
    'pointsEarned', 10 + bonus,
    'bonus', bonus,
    'balance', wallet.balance,
    'streak', wallet.streak,
    'lastCheckin', today,
    'today', today
  );
END;
$$;

-- Mengambil saldo, status check-in, dan 30 riwayat terbaru.
CREATE FUNCTION public.get_reward_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := (
    statement_timestamp() AT TIME ZONE 'Asia/Jakarta'
  )::DATE;
  wallet public.reward_wallets%ROWTYPE;
  history JSONB;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Login diperlukan'
      USING ERRCODE = '28000';
  END IF;

  SELECT * INTO wallet
  FROM public.reward_wallets
  WHERE user_id = uid;

  SELECT COALESCE(
    jsonb_agg(to_jsonb(entries) ORDER BY entries.id DESC),
    '[]'::JSONB
  )
  INTO history
  FROM (
    SELECT id, event_date, kind, points, created_at
    FROM public.reward_ledger
    WHERE user_id = uid
    ORDER BY id DESC
    LIMIT 30
  ) entries;

  RETURN jsonb_build_object(
    'balance', COALESCE(wallet.balance, 0),
    'streak', CASE
      WHEN wallet.last_checkin >= today - 1 THEN wallet.streak
      ELSE 0
    END,
    'lastCheckin', wallet.last_checkin,
    'today', today,
    'timezone', 'Asia/Jakarta',
    'checkedInToday', COALESCE(wallet.last_checkin >= today, FALSE),
    'history', history
  );
END;
$$;

-- Hanya pengguna yang sudah login boleh memanggil fungsi.
REVOKE ALL ON FUNCTION public.claim_daily_checkin()
  FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.get_reward_summary()
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.claim_daily_checkin()
  TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_reward_summary()
  TO authenticated;

COMMIT;