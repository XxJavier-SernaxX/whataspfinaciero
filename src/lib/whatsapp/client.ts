// ==============================================================================
// CLIENTE PARA ENVIAR MENSAJES POR WHATSAPP CLOUD API
// ==============================================================================
// Esta función toma el número de teléfono del usuario y el mensaje en texto,
// y se comunica con los servidores de Meta para entregar el mensaje por WhatsApp.

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Si no están configuradas las variables, informamos en la consola del servidor
  if (!token || !phoneId) {
    console.warn('⚠️ Credenciales de WhatsApp no configuradas en las variables de entorno.');
    return false;
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error al enviar mensaje por WhatsApp:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error de conexión con WhatsApp API:', error);
    return false;
  }
}
