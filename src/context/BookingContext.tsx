import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  timeSlot: string;
  status: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  size: number;
  type?: string;
  image?: string;
  status?: string;
  version?: number;
  bookings: Booking[];
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  studentId?: string;
  department?: string;
  avatar?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  name: string;
  role: string;
  studentId?: string;
  department?: string;
}

export interface UpdateProfilePayload {
  name: string;
  studentId?: string;
  department?: string;
  avatar?: string;
}

interface BookingContextType {
  rooms: Room[];
  user: UserAccount | null;
  myBookings: Booking[];
  login: (email: string, pass: string) => Promise<{ success: boolean; errorMessage?: string }>;
  register: (userData: RegisterPayload) => Promise<{ success: boolean; errorMessage?: string }>;
  loginWithGoogle?: () => Promise<{ success: boolean; errorMessage?: string }>;
  logout: () => void;
  updateUserProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean; errorMessage?: string }>;
  processBookingTransaction: (
    roomId: string,
    date: string,
    timeSlot: string,
    userName: string,
    userRole: string
  ) => Promise<{ success: boolean; errorMessage?: string }>;
  cancelBooking: (bookingId: string) => Promise<void>;
  fetchData: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  // Tải toàn bộ danh sách Phòng và Đặt Phòng từ Supabase
  const fetchData = useCallback(async () => {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

      if (roomsError || bookingsError) {
        console.error('Lỗi khi tải dữ liệu từ Supabase:', roomsError || bookingsError);
        return;
      }

      // Format dữ liệu Bookings đồng nhất về camelCase
      const formattedBookings: Booking[] = (bookingsData || []).map((b) => ({
        id: b.id,
        roomId: b.room_id,
        userId: b.user_id || '',
        userName: b.user_name,
        userRole: b.user_role,
        date: b.date,
        timeSlot: b.time_slot,
        status: b.status,
      }));

      // Ghép mảng bookings tương ứng vào từng Room
      const combinedRooms: Room[] = (roomsData || []).map((room) => ({
        ...room,
        bookings: formattedBookings.filter((b) => b.roomId === room.id),
      }));

      setRooms(combinedRooms);

      // Cập nhật danh sách đặt phòng của người dùng hiện tại
      if (user) {
        setMyBookings(formattedBookings.filter((b) => b.userId === user.id));
      } else {
        setMyBookings([]);
      }
    } catch (err) {
      console.error('Lỗi kết nối Supabase:', err);
    }
  }, [user]);

  // REALTIME SUBSCRIPTION
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // 🟢 Hàm Đăng Nhập bằng Tài Khoản / Mật Khẩu
  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', pass)
        .maybeSingle();

      if (error || !data) {
        return { success: false, errorMessage: 'Email hoặc mật khẩu không chính xác!' };
      }

      const loggedUser: UserAccount = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        studentId: data.student_id,
        department: data.department,
        avatar: data.avatar,
      };

      setUser(loggedUser);
      return { success: true };
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      return { success: false, errorMessage: 'Đã xảy ra lỗi khi đăng nhập!' };
    }
  };

  // 🟢 Hàm Đăng Ký Tài Khoản Mới
  const register = async (
    userData: RegisterPayload
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      const normalizedEmail = userData.email.trim().toLowerCase();

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        return { success: false, errorMessage: 'Email này đã được sử dụng!' };
      }

      const newUserId = `u-${Date.now()}`;
      const newUserRecord = {
        id: newUserId,
        email: normalizedEmail,
        password: userData.password || '123456',
        name: userData.name,
        role: userData.role || 'Sinh viên',
        student_id: userData.studentId || '',
        department: userData.department || 'Khoa CNTT',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop',
      };

      const { error } = await supabase.from('users').insert([newUserRecord]);

      if (error) {
        console.error('Lỗi khi đăng ký:', error);
        return { success: false, errorMessage: error.message || 'Không thể tạo tài khoản, vui lòng thử lại!' };
      }

      const loggedUser: UserAccount = {
        id: newUserRecord.id,
        email: newUserRecord.email,
        name: newUserRecord.name,
        role: newUserRecord.role,
        studentId: newUserRecord.student_id,
        department: newUserRecord.department,
        avatar: newUserRecord.avatar,
      };

      setUser(loggedUser);
      return { success: true };
    } catch (err) {
      console.error('Lỗi register:', err);
      return { success: false, errorMessage: 'Đã xảy ra lỗi hệ thống!' };
    }
  };

  // 🟢 Hàm Đăng Nhập Bằng Google
  const loginWithGoogle = async (): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: 'your-app-scheme',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error || !data?.url) {
        return { success: false, errorMessage: error?.message || 'Không khởi tạo được Google OAuth' };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const access_token = url.searchParams.get('access_token') || url.hash.match(/access_token=([^&]*)/)?.[1];
        const refresh_token = url.searchParams.get('refresh_token') || url.hash.match(/refresh_token=([^&]*)/)?.[1];

        if (access_token && refresh_token) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) return { success: false, errorMessage: sessionError.message };

          const authUser = sessionData.user;
          if (authUser) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Google User',
              role: 'Sinh viên',
              avatar: authUser.user_metadata?.avatar_url,
            });
          }

          return { success: true };
        }
      }

      return { success: false, errorMessage: 'Người dùng đã hủy đăng nhập.' };
    } catch (err) {
      console.error('Lỗi khi đăng nhập Google:', err);
      return { success: false, errorMessage: 'Có lỗi xảy ra khi kết nối Google.' };
    }
  };

  // 🟢 Hàm Đăng Xuất
  const logout = () => {
    setUser(null);
    setMyBookings([]);
  };

  // 🟢 Cập Nhật Thông Tin Cá Nhân Lên Supabase
  const updateUserProfile = async (
    payload: UpdateProfilePayload
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    if (!user) return { success: false, errorMessage: 'Người dùng chưa đăng nhập' };

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: payload.name,
          student_id: payload.studentId || '',
          department: payload.department || '',
          avatar: payload.avatar || user.avatar,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Lỗi cập nhật hồ sơ Supabase:', error);
        return { success: false, errorMessage: error.message };
      }

      // Cập nhật State cục bộ
      const updatedUser: UserAccount = {
        ...user,
        name: payload.name,
        studentId: payload.studentId,
        department: payload.department,
        avatar: payload.avatar || user.avatar,
      };

      setUser(updatedUser);

      // Cập nhật tên người dùng ở các đơn đặt phòng hiện có (nếu cần)
      await supabase
        .from('bookings')
        .update({ user_name: payload.name })
        .eq('user_id', user.id);

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Lỗi trong updateUserProfile:', err);
      return { success: false, errorMessage: 'Đã xảy ra lỗi khi lưu thông tin!' };
    }
  };

  // 🟢 Xử lý Đặt Phòng
  const processBookingTransaction = async (
    roomId: string,
    date: string,
    timeSlot: string,
    userName: string,
    userRole: string
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    if (!user) {
      return { success: false, errorMessage: 'Bạn chưa đăng nhập!' };
    }

    try {
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .eq('date', date.trim())
        .eq('time_slot', timeSlot.trim())
        .neq('status', 'Đã hủy');

      if (checkError) {
        console.error('Lỗi kiểm tra trùng lịch:', checkError);
        return { success: false, errorMessage: 'Không thể kiểm tra lịch phòng, vui lòng thử lại!' };
      }

      if (existingBookings && existingBookings.length > 0) {
        await fetchData();
        return {
          success: false,
          errorMessage: 'Rất tiếc! Khung giờ này vừa mới có người khác đặt trước.',
        };
      }

      const newBookingId = `BK-${Date.now()}`;

      const { error: insertError } = await supabase.from('bookings').insert([
        {
          id: newBookingId,
          room_id: roomId,
          user_id: user.id,
          user_name: userName,
          user_role: userRole,
          date: date.trim(),
          time_slot: timeSlot.trim(),
          status: 'Thành công',
        },
      ]);

      if (insertError) {
        console.error('Lỗi khi lưu đặt phòng:', insertError);
        return { success: false, errorMessage: 'Lưu đặt phòng thất bại, vui lòng thử lại!' };
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Lỗi xử lý transaction:', err);
      return { success: false, errorMessage: 'Đã xảy ra lỗi trong quá trình xử lý!' };
    }
  };

  // 🟢 Hàm Hủy Đặt Phòng
  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Đã hủy' })
        .eq('id', bookingId);

      if (error) {
        console.error('Lỗi khi hủy phòng:', error);
      } else {
        await fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi thực hiện hủy phòng:', err);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        user,
        myBookings,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserProfile,
        processBookingTransaction,
        cancelBooking,
        fetchData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};