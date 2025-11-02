export enum UserRole {
  ADMIN = 'admin',
  WORKER = 'worker',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  accessCode: string; // 4-digit PIN
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  pointsRedeemed: number;
  finalAmount: number;
  customerId?: string;
  pointsEarned: number;
  date: string; // ISO string
  servedBy: string; // User ID
}