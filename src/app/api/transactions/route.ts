// ==============================================================================
// RUTA DE TRANSACCIONES (/api/transactions)
// ==============================================================================
// Permite consultar los movimientos desde el panel web (FASE 13).
// GET → Lista de movimientos recientes del usuario
// POST → Crear un movimiento directamente (sin pasar por IA)

import { NextRequest, NextResponse } from 'next/server';
import { TransactionsService } from '@/services/transactions.service';
import { AccountType, TransactionType } from '@/types/database';

// GET: Obtener movimientos y saldos
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userPhone = searchParams.get('telefono') || '573001234567';
  const limit = parseInt(searchParams.get('limit') || '10');

  const [movimientos, saldos] = await Promise.all([
    TransactionsService.getRecentTransactions(userPhone, limit),
    TransactionsService.getBalance(userPhone),
  ]);

  return NextResponse.json({
    saldos,
    movimientos,
  });
}

// POST: Crear un movimiento manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_phone, account_type, type, amount, category, description, date } = body;

    // Validaciones básicas
    if (!user_phone || !account_type || !type || !amount || !category || !description) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios.' },
        { status: 400 }
      );
    }

    const resultado = await TransactionsService.createTransaction({
      user_phone,
      account_type: account_type as AccountType,
      type: type as TransactionType,
      amount: Number(amount),
      category,
      description,
      date,
    });

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: resultado.data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
