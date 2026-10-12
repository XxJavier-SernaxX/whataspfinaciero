// ==============================================================================
// CLIENTE DE CONEXIÓN A SUPABASE (POSTGRESQL)
// ==============================================================================
// Este archivo inicializa la conexión con la base de datos de Supabase.
// Usa las credenciales almacenadas en las variables de entorno.

import { createClient } from '@supabase/supabase-js';

// Obtenemos las claves de entorno (con fallback seguro para la fase de compilación)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Creamos y exportamos una única instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
