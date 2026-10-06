// ==============================================================================
// DEFINICIÓN DE TIPOS DE WHATSAPP CLOUD API
// ==============================================================================
// Representa la estructura de los eventos que Meta (WhatsApp) envía a nuestro webhook
// cuando un usuario nos manda un texto, una nota de voz o una foto.

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;               // Número de WhatsApp del remitente
          id: string;                 // ID único del mensaje
          timestamp: string;
          type: 'text' | 'audio' | 'image' | 'interactive' | 'unknown';
          text?: {
            body: string;             // Texto escrito por el usuario
          };
          audio?: {
            id: string;               // ID del archivo de audio para descargarlo de Meta
            mime_type: string;
          };
          image?: {
            id: string;               // ID de la foto enviada
            mime_type: string;
            caption?: string;
          };
        }>;
      };
      field: string;
    }>;
  }>;
}
