// ==============================================================================
// DEFINICIÓN DE TIPOS PARA LA INTELIGENCIA ARTIFICIAL (IA)
// ==============================================================================
// La IA nunca tocará la base de datos directamente.
// En su lugar, analiza lo que el usuario escribió y devuelve este formato estructurado.

import { AccountType, TransactionType } from './database';

// ------------------------------------------------------------------------------
// 1. Acciones o Intenciones que la IA puede reconocer
// ------------------------------------------------------------------------------
export type AIAction =
  | 'registrar_movimiento'      // "gasté 20 mil en comida", "vendí un funko en 35 mil"
  | 'consultar_saldo'           // "¿cuánto tengo?", "¿cuánto tengo del emprendimiento?"
  | 'consultar_resumen'         // "¿cuánto he gastado este mes?", "¿cuánto vendí esta semana?"
  | 'consultar_ganancia'        // "¿cuánto he ganado con el emprendimiento?"
  | 'consultar_movimientos'     // "muéstrame mis últimos movimientos"
  | 'crear_recordatorio'        // "todos los meses debo pagar el gimnasio el día 23"
  | 'corregir_ultimo'           // "el gasto anterior era de 25 mil, no 20 mil"
  | 'eliminar_ultimo'           // "borra el último gasto"
  | 'pedir_aclaracion'          // Cuando no sabe si es personal o emprendimiento
  | 'otro';                     // Saludos, dudas generales, etc.

// ------------------------------------------------------------------------------
// 2. Respuesta estructurada devuelta por la IA
// ------------------------------------------------------------------------------
export interface AIInterpretation {
  action: AIAction;

  // Datos para registrar un movimiento
  movimiento?: {
    account_type: AccountType | 'desconocido'; // Si es 'desconocido', preguntaremos al usuario
    type: TransactionType;                     // 'ingreso', 'gasto', 'venta', 'costo'
    amount: number;                            // Monto numérico (ej: 20000)
    category: string;                          // Ej: "comida", "materiales", "ventas"
    description: string;                       // Ej: "almuerzo", "Funko Pop Goku"
  };

  // Datos para crear un recordatorio
  recordatorio?: {
    title: string;                             // Ej: "Gimnasio"
    due_day: number;                           // Ej: 23
    amount?: number;                           // Ej: 40000
    account_type: AccountType;
  };

  // Datos para consultas por fecha o categoría
  consulta?: {
    periodo?: 'hoy' | 'semana' | 'mes' | 'año' | 'historico';
    account_type?: AccountType | 'todas';
    category?: string;                         // Ej: "filamento", "comida"
  };

  // Mensaje amigable generado para responder directamente al usuario
  mensaje_respuesta: string;
}
