-- ============================================================
-- SQL PATCH: Add logo_url column to portfolio_experiences and portfolio_tech
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add logo_url to portfolio_experiences
ALTER TABLE public.portfolio_experiences 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Add logo_url to portfolio_tech
ALTER TABLE public.portfolio_tech 
ADD COLUMN IF NOT EXISTS logo_url TEXT;
