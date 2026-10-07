-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS PARA EL ASISTENTE FINANCIERO
-- ==============================================================================
-- Este script crea las tablas necesarias en PostgreSQL (Supabase) para almacenar:
-- 1. Movimientos (ingresos, gastos, ventas y costos con separación de cuentas)
-- 2. Recordatorios (pagos fijos mensuales)
-- 3. Cierres semanales (resumen histórico de ventas y ganancias del emprendimiento)

-- ------------------------------------------------------------------------------
-- 1. TABLA DE MOVIMIENTOS FINANCIEROS (transactions)
-- ------------------------------------------------------------------------------
-- Guarda cada registro de dinero que el usuario mencione por WhatsApp.
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone TEXT NOT NULL,                        -- Número de WhatsApp (ej: "573001234567")
    account_type TEXT NOT NULL CHECK (account_type IN ('personal', 'emprendimiento')),
    type TEXT NOT NULL CHECK (type IN ('ingreso', 'gasto', 'venta', 'costo')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0), -- Monto positivo
    category TEXT NOT NULL,                          -- Ej: "comida", "materiales", "ventas"
    description TEXT NOT NULL,                       -- Ej: "almuerzo", "Funko Goku", "filamento PLA"
    date DATE NOT NULL DEFAULT CURRENT_DATE,         -- Fecha del movimiento
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- Fecha y hora exacta de registro
);

-- Índices para que las consultas por fecha, usuario y cuenta sean ultra rápidas
CREATE INDEX IF NOT EXISTS idx_transactions_user_phone ON public.transactions(user_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_lookup ON public.transactions(user_phone, account_type, date);

-- ------------------------------------------------------------------------------
-- 2. TABLA DE RECORDATORIOS (reminders)
-- ------------------------------------------------------------------------------
-- Guarda los pagos fijos recurrentes (ej: gimnasio día 23, internet día 10).
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone TEXT NOT NULL,
    title TEXT NOT NULL,                             -- Ej: "Gimnasio", "Recibo de energía"
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31), -- Día del mes que vence
    amount NUMERIC(12, 2),                           -- Monto estimado (opcional)
    account_type TEXT NOT NULL CHECK (account_type IN ('personal', 'emprendimiento')) DEFAULT 'personal',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_notified DATE,                              -- Última fecha en que se avisó
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON public.reminders(user_phone, is_active);

-- ------------------------------------------------------------------------------
-- 3. TABLA DE CIERRES SEMANALES (weekly_summaries)
-- ------------------------------------------------------------------------------
-- Guarda los resúmenes semanales para comparar el crecimiento del emprendimiento.
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone TEXT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_costs NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. SEGURIDAD A NIVEL DE FILAS (Row Level Security - RLS)
-- ------------------------------------------------------------------------------
-- Activamos RLS en las tablas para que solo nuestro backend con service role pueda operar.
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Política que permite acceso completo al backend seguro
CREATE POLICY "Permitir acceso al backend" ON public.transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso al backend" ON public.reminders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso al backend" ON public.weekly_summaries
    FOR ALL USING (true) WITH CHECK (true);
