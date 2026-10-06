// ==============================================================================
// DEFINICIÓN DE TIPOS DE LA BASE DE DATOS
// ==============================================================================
// Este archivo describe la forma exacta de los datos que guardaremos en Supabase.
// Nos ayuda a que TypeScript nos avise si intentamos guardar un dato con nombre equivocado.

// ------------------------------------------------------------------------------
// 1. Bolsillos / Cuentas disponibles
// ------------------------------------------------------------------------------
// Separación fundamental: dinero personal vs dinero del emprendimiento
export type AccountType = 'personal' | 'emprendimiento';

// ------------------------------------------------------------------------------
// 2. Tipos de movimientos financieros
// ------------------------------------------------------------------------------
// - ingreso: Dinero que entra al bolsillo personal (sueldo, mesada, regalo, etc.)
// - gasto: Dinero que sale del bolsillo personal (comida, transporte, etc.)
// - venta: Entrada por venta de productos del emprendimiento (ej: Funko, impresión 3D)
// - costo: Gasto de materiales o insumos del emprendimiento (ej: filamento, resina)
export type TransactionType = 'ingreso' | 'gasto' | 'venta' | 'costo';

// ------------------------------------------------------------------------------
// 3. Estructura de un Movimiento (Registro de dinero)
// ------------------------------------------------------------------------------
export interface Transaction {
  id: string;                    // Identificador único (UUID)
  user_phone: string;            // Número de WhatsApp del usuario dueño del movimiento
  account_type: AccountType;     // 'personal' o 'emprendimiento'
  type: TransactionType;         // 'ingreso', 'gasto', 'venta' o 'costo'
  amount: number;                // Monto en dinero (ej: 20000)
  category: string;              // Categoría (ej: "comida", "materiales", "servicios")
  description: string;           // Detalle o nota (ej: "hamburguesa", "filamento PLA")
  date: string;                  // Fecha del movimiento (formato ISO: YYYY-MM-DD)
  created_at?: string;           // Fecha y hora exacta de creación en el sistema
}

// ------------------------------------------------------------------------------
// 4. Estructura de un Recordatorio (Pagos fijos mensuales)
// ------------------------------------------------------------------------------
export interface Reminder {
  id: string;                    // Identificador único
  user_phone: string;            // Número de WhatsApp del usuario
  title: string;                 // Título (ej: "Gimnasio", "Recibo de luz")
  amount?: number;               // Monto aproximado si se conoce (ej: 40000)
  due_day: number;               // Día del mes en que vence (del 1 al 31)
  account_type: AccountType;     // Si el pago es 'personal' o de 'emprendimiento'
  is_active: boolean;            // Para pausar o reactivar el recordatorio
  created_at?: string;
}

// ------------------------------------------------------------------------------
// 5. Estructura de Cierre Semanal (Resumen de ventas y ganancias)
// ------------------------------------------------------------------------------
export interface WeeklySummary {
  id: string;
  user_phone: string;
  week_start: string;            // Fecha de inicio de la semana
  week_end: string;              // Fecha de fin de la semana
  total_sales: number;           // Total de ventas registradas
  total_costs: number;           // Total de costos/gastos del emprendimiento
  net_profit: number;            // Ganancia real = Ventas - Costos
  created_at?: string;
}
