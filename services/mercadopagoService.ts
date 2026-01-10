
import { PaymentSettings } from "../types";

/**
 * Simula la consulta a la API de Mercado Pago
 * En un entorno real, esto haría un fetch a:
 * https://api.mercadopago.com/v1/payments/{id}
 */
export async function verifyPaymentWithAPI(paymentId: string, expectedAmount: number): Promise<{
  verified: boolean;
  status: string;
  externalDetails?: any;
}> {
  // Simulamos latencia de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulación de validación: 
  // En producción, aquí usaríamos el Access Token de StorageService.getPaymentSettings().mpAccessToken
  
  // Para la demo: validamos si el ID tiene un formato razonable
  if (paymentId && paymentId.length > 5) {
    return {
      verified: true,
      status: 'approved',
      externalDetails: {
        date_approved: new Date().toISOString(),
        payment_method_id: 'account_money',
        transaction_amount: expectedAmount
      }
    };
  }

  return { verified: false, status: 'not_found' };
}
