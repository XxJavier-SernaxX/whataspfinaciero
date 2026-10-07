// ==============================================================================
// PROCESADOR DE MENSAJES (Message Processor)
// ==============================================================================
// Este es el "cerebro" del asistente. Recibe el texto del usuario,
// se lo pasa a la IA para interpretarlo, y según la respuesta decide
// qué hacer: guardar un movimiento, consultar saldo, crear recordatorio, etc.
//
// FLUJO:
// WhatsApp → Webhook → procesarMensaje() → IA → Base de datos → Respuesta

import { AIService } from './ai.service';
import { TransactionsService } from './transactions.service';
import { RemindersService } from './reminders.service';
import { AccountType, TransactionType } from '@/types/database';

// Función que formatea un número como moneda colombiana
// Ej: 20000 → "$20.000"
function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

// Función que devuelve el emoji según el tipo de movimiento
function emojiForType(type: string): string {
  const emojis: Record<string, string> = {
    ingreso: '💰',
    gasto: '💸',
    venta: '🛍️',
    costo: '📦',
  };
  return emojis[type] || '📝';
}

// ==============================================================================
// FUNCIÓN PRINCIPAL: procesar cualquier mensaje del usuario
// ==============================================================================
export async function procesarMensaje(
  userPhone: string,
  texto: string
): Promise<string> {

  // Paso 1: Le preguntamos a la IA qué quiere hacer el usuario
  const interpretacion = await AIService.interpretMessage(texto);

  // Paso 2: Actuamos según la intención detectada
  switch (interpretacion.action) {

    // --------------------------------------------------------------------------
    // CASO: El usuario quiere registrar un movimiento (gasto, ingreso, venta, costo)
    // --------------------------------------------------------------------------
    case 'registrar_movimiento': {
      const mov = interpretacion.movimiento;

      if (!mov) {
        return '🤔 No entendí bien el movimiento. ¿Puedes repetirlo con más detalle?';
      }

      // Si la IA no sabe si es personal o emprendimiento, preguntamos
      if (mov.account_type === 'desconocido') {
        return interpretacion.mensaje_respuesta ||
          '🤔 ¿Este movimiento es *personal* o del *emprendimiento*?';
      }

      // Guardamos el movimiento en la base de datos
      const resultado = await TransactionsService.createTransaction({
        user_phone: userPhone,
        account_type: mov.account_type as AccountType,
        type: mov.type as TransactionType,
        amount: mov.amount,
        category: mov.category,
        description: mov.description,
      });

      if (!resultado.success) {
        return `❌ Hubo un error guardando el movimiento: ${resultado.error}`;
      }

      // Confirmamos al usuario con un mensaje amigable
      const emoji = emojiForType(mov.type);
      const cuenta = mov.account_type === 'personal' ? '👤 Personal' : '💼 Emprendimiento';
      return (
        `${emoji} *Registrado correctamente*\n\n` +
        `Tipo: ${mov.type}\n` +
        `Valor: ${formatMoney(mov.amount)}\n` +
        `Categoría: ${mov.category}\n` +
        `Descripción: ${mov.description}\n` +
        `Cuenta: ${cuenta}`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario pregunta cuánto tiene (saldo)
    // --------------------------------------------------------------------------
    case 'consultar_saldo': {
      const filtro = interpretacion.consulta?.account_type;
      const saldos = await TransactionsService.getBalance(userPhone);

      // Si preguntó específicamente por una cuenta
      if (filtro === 'personal') {
        return `👤 *Saldo Personal*\n${formatMoney(saldos.personal)}`;
      }
      if (filtro === 'emprendimiento') {
        return `💼 *Saldo Emprendimiento*\n${formatMoney(saldos.emprendimiento)}`;
      }

      // Si preguntó en general, mostramos ambos
      return (
        `💳 *Resumen de saldos*\n\n` +
        `👤 Personal: ${formatMoney(saldos.personal)}\n` +
        `💼 Emprendimiento: ${formatMoney(saldos.emprendimiento)}\n` +
        `━━━━━━━━━━━━━━\n` +
        `📊 Total: ${formatMoney(saldos.total)}`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario pregunta resumen (gastos del mes, ventas de la semana, etc.)
    // --------------------------------------------------------------------------
    case 'consultar_resumen': {
      const periodo = interpretacion.consulta?.periodo || 'mes';
      const hoy = new Date();
      let startDate: string | undefined;

      // Calculamos la fecha de inicio según el período que pidió
      if (periodo === 'hoy') {
        startDate = hoy.toISOString().split('T')[0];
      } else if (periodo === 'semana') {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        startDate = inicioSemana.toISOString().split('T')[0];
      } else if (periodo === 'mes') {
        startDate = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
      }

      const endDate = hoy.toISOString().split('T')[0];
      const ganancias = await TransactionsService.getBusinessProfit(userPhone, startDate, endDate);
      const saldos = await TransactionsService.getBalance(userPhone);

      const nombrePeriodo: Record<string, string> = {
        hoy: 'hoy',
        semana: 'esta semana',
        mes: 'este mes',
        año: 'este año',
        historico: 'hasta ahora',
      };

      return (
        `📊 *Resumen ${nombrePeriodo[periodo] || 'del período'}*\n\n` +
        `👤 *Personal*\n` +
        `  Saldo: ${formatMoney(saldos.personal)}\n\n` +
        `💼 *Emprendimiento*\n` +
        `  Ventas: ${formatMoney(ganancias.sales)}\n` +
        `  Costos: ${formatMoney(ganancias.costs)}\n` +
        `  Ganancia: ${formatMoney(ganancias.profit)}`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario pregunta ganancias del emprendimiento
    // --------------------------------------------------------------------------
    case 'consultar_ganancia': {
      const periodo = interpretacion.consulta?.periodo || 'mes';
      const hoy = new Date();
      let startDate: string | undefined;

      if (periodo === 'semana') {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        startDate = inicioSemana.toISOString().split('T')[0];
      } else if (periodo === 'mes') {
        startDate = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
      }

      const endDate = hoy.toISOString().split('T')[0];
      const g = await TransactionsService.getBusinessProfit(userPhone, startDate, endDate);

      const periodoLabel: Record<string, string> = {
        semana: 'esta semana',
        mes: 'este mes',
        historico: 'hasta ahora',
      };

      return (
        `💼 *Ganancias del emprendimiento (${periodoLabel[periodo] || 'este mes'})*\n\n` +
        `🛍️ Ventas: ${formatMoney(g.sales)}\n` +
        `📦 Costos: ${formatMoney(g.costs)}\n` +
        `━━━━━━━━━━━━━━\n` +
        `✅ Ganancia neta: ${formatMoney(g.profit)}`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario quiere ver los últimos movimientos
    // --------------------------------------------------------------------------
    case 'consultar_movimientos': {
      const movimientos = await TransactionsService.getRecentTransactions(userPhone, 5);

      if (movimientos.length === 0) {
        return '📋 Aún no tienes movimientos registrados.';
      }

      const lineas = movimientos.map((m) => {
        const emoji = emojiForType(m.type);
        return `${emoji} ${m.description} — ${formatMoney(m.amount)} (${m.category})`;
      });

      return `📋 *Últimos movimientos*\n\n${lineas.join('\n')}`;
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario quiere crear un recordatorio
    // --------------------------------------------------------------------------
    case 'crear_recordatorio': {
      const rec = interpretacion.recordatorio;

      if (!rec) {
        return '🤔 No entendí bien el recordatorio. ¿Puedes darme más detalles?';
      }

      const resultado = await RemindersService.createReminder({
        user_phone: userPhone,
        title: rec.title,
        due_day: rec.due_day,
        amount: rec.amount,
        account_type: rec.account_type,
      });

      if (!resultado.success) {
        return `❌ No pude guardar el recordatorio: ${resultado.error}`;
      }

      return (
        `🔔 *Recordatorio guardado*\n\n` +
        `📌 ${rec.title}\n` +
        `📅 Día ${rec.due_day} de cada mes\n` +
        `${rec.amount ? `💰 Monto aprox: ${formatMoney(rec.amount)}\n` : ''}` +
        `\nTe avisaré una semana antes, el día anterior y el mismo día.`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: El usuario quiere borrar el último movimiento
    // --------------------------------------------------------------------------
    case 'eliminar_ultimo': {
      const resultado = await TransactionsService.deleteLastTransaction(userPhone);

      if (!resultado.success) {
        return `❌ ${resultado.error}`;
      }

      const d = resultado.deleted!;
      return (
        `🗑️ *Movimiento eliminado*\n\n` +
        `${d.description} — ${formatMoney(d.amount)}\n` +
        `Categoría: ${d.category}`
      );
    }

    // --------------------------------------------------------------------------
    // CASO: La IA pide aclaración al usuario (no sabe si es personal o emprendimiento)
    // --------------------------------------------------------------------------
    case 'pedir_aclaracion': {
      return interpretacion.mensaje_respuesta ||
        '🤔 ¿Esto es *personal* o del *emprendimiento*?';
    }

    // --------------------------------------------------------------------------
    // CASO: Cualquier otra cosa (saludos, preguntas generales, etc.)
    // --------------------------------------------------------------------------
    default: {
      return interpretacion.mensaje_respuesta ||
        '👋 Hola Javier. Puedo registrar tus gastos e ingresos, consultar tu saldo y más. ¿Qué necesitas?';
    }
  }
}
