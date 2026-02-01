-- ============================================
-- Schéma ENOC Agency — tables et RLS
-- À exécuter dans le SQL Editor du projet Supabase
-- ============================================

-- Extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------
-- Tables
-- --------------------------------------------

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.amazon_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  units INTEGER NOT NULL DEFAULT 0,
  marketplace TEXT NOT NULL
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asin TEXT NOT NULL,
  sku TEXT,
  title TEXT,
  stock INTEGER DEFAULT 0,
  bsr INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les jointures et filtres courants
CREATE INDEX idx_users_client_id ON public.users(client_id);
CREATE INDEX idx_amazon_credentials_client_id ON public.amazon_credentials(client_id);
CREATE INDEX idx_sales_client_id ON public.sales(client_id);
CREATE INDEX idx_sales_date ON public.sales(client_id, date);
CREATE INDEX idx_products_client_id ON public.products(client_id);
CREATE INDEX idx_products_asin ON public.products(client_id, asin);

-- --------------------------------------------
-- Fonction helper : client_id de l'utilisateur connecté
-- --------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.users WHERE id = auth.uid();
$$;

-- --------------------------------------------
-- Row Level Security (RLS)
-- --------------------------------------------

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amazon_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- clients : un utilisateur ne voit que la ligne de son client
CREATE POLICY "clients_select_own"
  ON public.clients FOR SELECT
  USING (id = public.get_my_client_id());

CREATE POLICY "clients_update_own"
  ON public.clients FOR UPDATE
  USING (id = public.get_my_client_id());

-- users : un utilisateur ne voit que les users de son client
CREATE POLICY "users_select_same_client"
  ON public.users FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- amazon_credentials : accès uniquement aux credentials de son client
CREATE POLICY "amazon_credentials_select_own"
  ON public.amazon_credentials FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "amazon_credentials_insert_own"
  ON public.amazon_credentials FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "amazon_credentials_update_own"
  ON public.amazon_credentials FOR UPDATE
  USING (client_id = public.get_my_client_id());

CREATE POLICY "amazon_credentials_delete_own"
  ON public.amazon_credentials FOR DELETE
  USING (client_id = public.get_my_client_id());

-- sales : accès uniquement aux ventes de son client
CREATE POLICY "sales_select_own"
  ON public.sales FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "sales_insert_own"
  ON public.sales FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "sales_update_own"
  ON public.sales FOR UPDATE
  USING (client_id = public.get_my_client_id());

CREATE POLICY "sales_delete_own"
  ON public.sales FOR DELETE
  USING (client_id = public.get_my_client_id());

-- products : accès uniquement aux produits de son client
CREATE POLICY "products_select_own"
  ON public.products FOR SELECT
  USING (client_id = public.get_my_client_id());

CREATE POLICY "products_insert_own"
  ON public.products FOR INSERT
  WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE
  USING (client_id = public.get_my_client_id());

CREATE POLICY "products_delete_own"
  ON public.products FOR DELETE
  USING (client_id = public.get_my_client_id());
