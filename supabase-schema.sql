-- ============================================================
-- Crossly 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 用户表（扩展 Supabase auth）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',         -- 'free' | 'pro'
  plan_expires_at TIMESTAMPTZ,               -- pro 到期时间，NULL=永久
  product_count INTEGER NOT NULL DEFAULT 0, -- 已导入商品数
  quota INTEGER NOT NULL DEFAULT 100,        -- 免费50，付费无限(-1)
  api_token TEXT UNIQUE,                    -- 插件用的 token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商品表（替换 Redis，按用户隔离）
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,                      -- 完整 Product JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订阅/支付记录
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,                       -- 'pro_monthly' | 'pro_yearly'
  amount INTEGER NOT NULL,                  -- 分（599 = ¥5.99）
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'paid' | 'expired'
  payment_provider TEXT,                    -- 'aifadian' | 'wechat' | 'alipay'
  payment_id TEXT,                          -- 第三方订单号
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS products_user_id_idx ON public.products(user_id);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_api_token_idx ON public.profiles(api_token);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: 只能读写自己的
CREATE POLICY "profiles_self" ON public.profiles
  USING (auth.uid() = id);

-- products: 只能读写自己的
CREATE POLICY "products_self" ON public.products
  USING (auth.uid() = user_id);

-- subscriptions: 只能读自己的
CREATE POLICY "subscriptions_self" ON public.subscriptions
  USING (auth.uid() = user_id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, api_token)
  VALUES (
    NEW.id,
    NEW.email,
    encode(gen_random_bytes(32), 'hex')  -- 自动生成 API token
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新商品计数的函数
CREATE OR REPLACE FUNCTION public.update_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET product_count = product_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET product_count = product_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_product_change
  AFTER INSERT OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_product_count();
