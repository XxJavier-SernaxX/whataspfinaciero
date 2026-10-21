// ==============================================================================
// CLIENTE DE CONEXIÓN A SUPABASE (POSTGRESQL)
// ==============================================================================
// Este archivo inicializa la conexión con la base de datos de Supabase.
// Usa las credenciales almacenadas en las variables de entorno.
// Se usa getSupabase() en cada llamada para leer las variables en runtime (Vercel).

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL pública oficial del proyecto de Javier en Supabase (no es secreta)
const DEFAULT_SUPABASE_URL = 'https://palreejtvcyeohliwjjc.supabase.co';

// Devuelve un cliente fresco con las credenciales del entorno actual
export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// Alias: los servicios llaman getSupabase() directamente para evitar problemas de tipado
export const supabase = {
  get client(): SupabaseClient {
    return getSupabase();
  },
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
  rpc: (...args: Parameters<SupabaseClient['rpc']>) => getSupabase().rpc(...args),
};
