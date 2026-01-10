
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

export enum NotificationLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  autopilotEnabled?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: string;
  receiptUrl?: string;
  externalRef?: string;
  processedBy?: string;
  timestamp: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderPhone: string;
  receiverPhone: string;
  text: string;
  timestamp: string;
  isIncoming: boolean;
  sentByAI?: boolean;
  hasAttachment?: boolean;
  attachmentType?: 'image' | 'document';
}

export interface ValidationResult {
  isValid: boolean;
  amount?: number;
  transactionId?: string;
  senderName?: string;
  date?: string;
  confidence: number;
  error?: string;
  apiVerified?: boolean;
}

export interface WhatsAppSettings {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  verifyToken: string;
  webhookUrl: string;
  isConnected: boolean;
  globalAutopilot: boolean;
  aiPrompt: string;
  aiModel: 'gemini-3-flash-preview' | 'gemini-3-pro-preview'; // Selección de modelo
  aiStatus: 'ONLINE' | 'OFFLINE' | 'TESTING';
}

export interface PaymentSettings {
  holderName: string;
  alias: string;
  cvu: string;
  bankName: string;
  isActive: boolean;
  mpAccessToken?: string;
}

export interface AppSettings {
  payment: PaymentSettings;
  whatsapp: WhatsAppSettings;
}
