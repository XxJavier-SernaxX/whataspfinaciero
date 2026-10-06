// ==============================================================================
// SERVICIO DE MOVIMIENTOS FINANCIEROS (TRANSACTIONS SERVICE)
// ==============================================================================
// Este módulo contiene toda la lógica de negocio para:
// - Registrar ingresos, gastos, ventas y costos.
// - Separar las cuentas 'personal' y 'emprendimiento'.
// - Consultar saldos acumulados de cada bolsillo.
// - Consultar ganancias reales del emprendimiento (Ventas - Costos).
// - Modificar o eliminar el último movimiento.

import { supabase } from '@/lib/supabase/client';
import { Transaction, AccountType, TransactionType } from '@/types/database';

export class TransactionsService {
  // ----------------------------------------------------------------------------
  // 1. Registrar un nuevo movimiento
  // ----------------------------------------------------------------------------
  static async createTransaction(data: {
    user_phone: string;
    account_type: AccountType;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date?: string;
  }): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      const today = data.date || new Date().toISOString().split('T')[0];

      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_phone: data.user_phone,
            account_type: data.account_type,
            type: data.type,
            amount: data.amount,
            category: data.category.toLowerCase().trim(),
            description: data.description.trim(),
            date: today,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error insertando transacción en Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: inserted as Transaction };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ----------------------------------------------------------------------------
  // 2. Obtener saldo actual (Personal o Emprendimiento)
  // ----------------------------------------------------------------------------
  static async getBalance(
    user_phone: string,
    account_type?: AccountType
  ): Promise<{ personal: number; emprendimiento: number; total: number }> {
    try {
      let query = supabase
        .from('transactions')
        .select('account_type, type, amount')
        .eq('user_phone', user_phone);

      if (account_type) {
        query = query.eq('account_type', account_type);
      }

      const { data, error } = await query;

      if (error || !data) {
        return { personal: 0, emprendimiento: 0, total: 0 };
      }

      let personal = 0;
      let emprendimiento = 0;

      for (const item of data) {
        const amount = Number(item.amount);
        if (item.account_type === 'personal') {
          // Ingreso suma, gasto resta
          personal += item.type === 'ingreso' ? amount : -amount;
        } else if (item.account_type === 'emprendimiento') {
          // Venta/Ingreso suma, Costo/Gasto resta
          emprendimiento += (item.type === 'venta' || item.type === 'ingreso') ? amount : -amount;
        }
      }

      return {
        personal,
        emprendimiento,
        total: personal + emprendimiento,
      };
    } catch {
      return { personal: 0, emprendimiento: 0, total: 0 };
    }
  }

  // ----------------------------------------------------------------------------
  // 3. Obtener ganancias del emprendimiento en un rango de fechas
  // ----------------------------------------------------------------------------
  static async getBusinessProfit(
    user_phone: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ sales: number; costs: number; profit: number }> {
    try {
      let query = supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_phone', user_phone)
        .eq('account_type', 'emprendimiento');

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error || !data) {
        return { sales: 0, costs: 0, profit: 0 };
      }

      let sales = 0;
      let costs = 0;

      for (const item of data) {
        const amount = Number(item.amount);
        if (item.type === 'venta' || item.type === 'ingreso') {
          sales += amount;
        } else {
          costs += amount;
        }
      }

      return {
        sales,
        costs,
        profit: sales - costs, // Ganancia neta = Ventas menos costos
      };
    } catch {
      return { sales: 0, costs: 0, profit: 0 };
    }
  }

  // ----------------------------------------------------------------------------
  // 4. Obtener los últimos movimientos registrados
  // ----------------------------------------------------------------------------
  static async getRecentTransactions(
    user_phone: string,
    limit: number = 5
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_phone', user_phone)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data as Transaction[];
    } catch {
      return [];
    }
  }

  // ----------------------------------------------------------------------------
  // 5. Eliminar el último movimiento
  // ----------------------------------------------------------------------------
  static async deleteLastTransaction(
    user_phone: string
  ): Promise<{ success: boolean; deleted?: Transaction; error?: string }> {
    try {
      // Primero buscamos cuál es el último
      const { data: latest, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_phone', user_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError || !latest) {
        return { success: false, error: 'No se encontraron movimientos para eliminar.' };
      }

      // Procedemos a eliminarlo
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', latest.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true, deleted: latest as Transaction };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
