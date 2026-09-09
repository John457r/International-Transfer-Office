export interface User {
  id: string;
  username: string;
  name: string;
  balance: number;
  accountNumber: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked' | 'Pending Admin Review' | 'APPROVED' | 'HOLD';
  isBlocked?: boolean;
  currency: 'USD' | 'PGK' | 'NGN';
  currencyApproved: boolean;
  transfersEnabled: boolean;
  tc: string;
  vc: string;
  sc: string;
  currentTC?: string;
  currentVC?: string;
  currentSC?: string;
  customError?: string;
  email?: string;
  phone?: string;
  country?: string;
}

export interface Transfer {
  id: string;
  userId: string;
  trackingId?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  userName?: string;
}

export interface CollectionRequest {
  id: string;
  userId: string;
  username: string;
  password?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  userName?: string;
}

export interface CardRequest {
  id: string;
  userId: string;
  name: string;
  address: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  userName?: string;
}

export interface SecuritySettings {
  requireTransactionCode: boolean;
  requireVerificationCode: boolean;
  requireSwitchCode: boolean;
  transfersEnabled: boolean;
}
