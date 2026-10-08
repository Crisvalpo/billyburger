/**
 * Configuración centralizada de WhatsApp para Billy Burger
 * Permite cambiar el número desde el Panel Admin o por variable de entorno sin tocar código.
 */

export const DEFAULT_WHATSAPP_NUMBER = '+56 9 3255 3527';

/**
 * Obtiene el número formateado visible (ej: +56 9 3255 3527)
 */
export function getWhatsAppDisplay(configNum?: string): string {
  if (configNum && configNum.trim()) return configNum.trim();
  if (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.trim();
  return DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Limpia el número dejándolo solo con dígitos para links wa.me o tel: (ej: 56932553527)
 */
export function getWhatsAppRaw(configNum?: string): string {
  const display = getWhatsAppDisplay(configNum);
  return display.replace(/[^0-9]/g, '');
}

/**
 * Genera el enlace directo a WhatsApp con texto opcional
 */
export function getWhatsAppLink(configNum?: string, text?: string): string {
  const raw = getWhatsAppRaw(configNum);
  const base = `https://wa.me/${raw}`;
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return base;
}
