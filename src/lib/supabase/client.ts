// ==============================================================================
// CLIENTE DE CONEXIÓN A SUPABASE (POSTGRESQL)
// ==============================================================================
// Este archivo inicializa la conexión con la base de datos de Supabase.
// Usa las credenciales almacenadas en las variables de entorno.

import { createClient } from '@supabase/supabase-js';

// Obtenemos las claves de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Creamos y exportamos una única instancia del cliente de Supabase
// Usamos el Service Role Key para operaciones de backend seguras en el webhook
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
