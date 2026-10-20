// ==============================================================================
// CLIENTE DE CONEXIÓN A SUPABASE (POSTGRESQL)
// ==============================================================================
// Este archivo inicializa la conexión con la base de datos de Supabase.
// Usa las credenciales almacenadas en las variables de entorno.

import { createClient } from '@supabase/supabase-js';

// URL pública oficial del proyecto de Javier en Supabase (no es secreta)
const DEFAULT_SUPABASE_URL = 'https://palreejtvcyeohliwjjc.supabase.co';

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// Proxy transparente para que supabase.from(...) siempre se ejecute con las credenciales activas en tiempo real
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
