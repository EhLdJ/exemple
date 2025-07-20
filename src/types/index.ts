// Enums
export enum UserRole {
  CLIENT = 'client',
  SHOPKEEPER = 'shopkeeper',
  ADMIN = 'admin'
}

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial'
}

// User Types
export interface User {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  shopName?: string; // Pour les boutiquiers
  identityCard?: string; // Pour les clients
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  shopkeeperId: number;
}

// Loan Types
export interface Loan {
  id: number;
  clientId: number;
  shopkeeperId: number;
  products: LoanProduct[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: LoanStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  dueDate?: string;
  qrCode?: string;
  qrExpiry?: string;
}

export interface LoanProduct {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isPaid: boolean;
}

// QR Code Types
export interface QRData {
  loanId: number;
  clientId: number;
  shopkeeperId: number;
  amount: number;
  timestamp: number;
  signature: string;
}

export interface QRGenerationResponse {
  qrCode: string;
  expiryTime: number;
  loanId: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterClientRequest {
  phone: string;
  name: string;
  identityCard: string;
}

export interface RegisterShopkeeperRequest {
  phone: string;
  email: string;
  name: string;
  shopName: string;
  inviteToken: string;
}

export interface SMSVerificationRequest {
  phone: string;
  code: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  RegisterChoice: undefined;
  ClientRegister: undefined;
  ShopkeeperRegister: undefined;
  SMSVerification: { phone: string; isLogin: boolean };
};

export type ClientStackParamList = {
  MyLoans: undefined;
  LoanDetails: { loanId: number };
  QRGenerator: { loanId: number };
  AIAssistant: undefined;
  Profile: undefined;
};

export type ShopkeeperStackParamList = {
  Dashboard: undefined;
  NewLoan: undefined;
  ClientSelection: undefined;
  ProductSelection: { clientId: number };
  LoanSummary: { clientId: number; products: LoanProduct[] };
  QRScanner: undefined;
  AllLoans: undefined;
  Inventory: undefined;
  Profile: undefined;
};

// Component Props Types
export interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
  userRole: UserRole;
}

export interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isSelected?: boolean;
  quantity?: number;
}

export interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export interface AIAssistantProps {
  userRole: UserRole;
  userId: number;
}

// Statistics Types
export interface ShopkeeperStats {
  totalLoans: number;
  activeLoans: number;
  monthlyRevenue: number;
  pendingPayments: number;
  topProducts: Array<{
    name: string;
    loanCount: number;
  }>;
}

export interface ClientStats {
  totalLoans: number;
  activeLoans: number;
  totalBorrowed: number;
  totalPaid: number;
  lastLoanDate?: string;
}

// Sync Engine Types
export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface OfflineData {
  loans: Loan[];
  products: Product[];
  users: User[];
  lastSync: number;
}