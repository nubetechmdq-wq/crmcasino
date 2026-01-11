
import { User, UserRole, Transaction, TransactionStatus, TransactionType, Message, PaymentSettings, WhatsAppSettings, AppSettings } from "../types";
import { supabase } from "./supabaseClient";

const DEFAULT_AI_PROMPT = `Eres el asistente oficial de Flowbi. 
Tu tono debe ser emocionante, profesional y persuasivo. Usa emojis de casino (🎰, 💰, 🔥).

Reglas:
1. Si el jugador pregunta cómo cargar saldo, pásale estos datos:
Titular: {{titular}}
Alias: {{alias}}
2. Si el jugador envía un comprobante, agradécele y dile que un cajero lo validará en segundos.
3. Si el jugador pregunta por su balance, dile que tiene \${{saldo}} disponibles.
4. Siempre termina invitándolo a jugar a sus slots favoritos.`;

const INITIAL_SETTINGS: AppSettings = {
  payment: {
    holderName: 'FLOWBI OFICIAL',
    alias: 'flowbi.mp',
    cvu: '0000003100012345678901',
    bankName: 'Mercado Pago',
    isActive: true,
    mpAccessToken: ''
  },
  whatsapp: {
    accessToken: '',
    phoneNumberId: '',
    wabaId: '',
    verifyToken: 'flowbi_secure_token_2024',
    webhookUrl: 'https://api.flowbi.crm/webhooks/whatsapp',
    isConnected: false,
    globalAutopilot: false,
    aiPrompt: DEFAULT_AI_PROMPT,
    aiModel: 'gemini-3-flash-preview',
    aiStatus: 'ONLINE'
  }
};

export class StorageService {
  private static settings = { ...INITIAL_SETTINGS };

  // Sync methods for simple state (can be improved with state management)
  static async getUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  static async getTransactions() {
    const { data } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
    return data || [];
  }

  static async getMessages() {
    const { data } = await supabase.from('messages').select('*').order('timestamp', { ascending: true });
    return data || [];
  }

  static async addMessage(msg: Partial<Message>) {
    await supabase.from('messages').insert(msg);
  }

  static getPaymentSettings() { return this.settings.payment; }
  static getWhatsAppSettings() { return this.settings.whatsapp; }

  static updatePaymentSettings(settings: PaymentSettings) {
    this.settings.payment = { ...settings };
  }

  static updateWhatsAppSettings(settings: WhatsAppSettings) {
    this.settings.whatsapp = { ...settings };
  }

  static async addUser(user: Partial<User>) {
    await supabase.from('users').insert(user);
  }

  static async toggleUserAutopilot(userId: string, currentState: boolean) {
    await supabase.from('users').update({ autopilot_enabled: !currentState }).eq('id', userId);
  }

  static async addTransaction(tx: Partial<Transaction>) {
    const { data, error } = await supabase.from('transactions').insert(tx).select().single();
    if (data && tx.status === TransactionStatus.APPROVED) {
      // Update balance in DB
      const amount = tx.type === TransactionType.DEPOSIT ? tx.amount : -tx.amount!;
      await supabase.rpc('increment_balance', { x: amount, row_id: tx.userId });
    }
  }

  static async updateTransactionStatus(txId: string, status: TransactionStatus, adminId: string) {
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (tx && tx.status === TransactionStatus.PENDING) {
      const { error } = await supabase.from('transactions').update({ status, processedBy: adminId }).eq('id', txId);

      if (!error && status === TransactionStatus.APPROVED) {
        const amount = tx.type === TransactionType.DEPOSIT ? tx.amount : -tx.amount;
        await supabase.rpc('increment_balance', { x: amount, row_id: tx.userId });
      }
    }
  }
}
