// src/types/index.ts

export type UserRole = 'Sinh viên' | 'Giảng viên' | 'Admin';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  studentId: string;
  department: string;
}

export interface BookingItem {
  id: string;
  roomName: string;
  location: string;
  size?: number | string;
  date: string;
  timeSlot: string;
  status: 'Đã đặt' | 'Đã hủy' | string;
  userRole?: string;
  image?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  studentId: string;
  department: string;
}

export interface AuthResponse {
  success: boolean;
  errorMessage?: string;
}