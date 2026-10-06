// ==============================================================================
// SERVICIO DE RECORDATORIOS (REMINDERS SERVICE)
// ==============================================================================
// Este módulo gestiona los pagos programados fijos (ej: gimnasio día 23, luz día 10).
// Permite guardar recordatorios y consultar cuáles vencen próximamente.

import { supabase } from '@/lib/supabase/client';
import { Reminder, AccountType } from '@/types/database';

export class RemindersService {
  // ----------------------------------------------------------------------------
  // 1. Guardar un nuevo recordatorio recurrente
  // ----------------------------------------------------------------------------
  static async createReminder(data: {
    user_phone: string;
    title: string;
    due_day: number;
    amount?: number;
    account_type: AccountType;
  }): Promise<{ success: boolean; data?: Reminder; error?: string }> {
    try {
      const { data: inserted, error } = await supabase
        .from('reminders')
        .insert([
          {
            user_phone: data.user_phone,
            title: data.title.trim(),
            due_day: data.due_day,
            amount: data.amount,
            account_type: data.account_type,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: inserted as Reminder };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ----------------------------------------------------------------------------
  // 2. Listar todos los recordatorios activos del usuario
  // ----------------------------------------------------------------------------
  static async getActiveReminders(user_phone: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_phone', user_phone)
        .eq('is_active', true)
        .order('due_day', { ascending: true });

      if (error || !data) return [];
      return data as Reminder[];
    } catch {
      return [];
    }
  }
}
