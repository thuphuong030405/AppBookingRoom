// src/data/mockData.ts
import { Room, UserAccount } from '../context/BookingContext';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'R1',
    name: 'Phòng Lab 401 - AI & Data',
    location: 'Tòa A - Tầng 4',
    size: 40,
    type: 'Thực hành máy tính',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R2',
    name: 'Phòng Lab 202 - Mạng máy tính',
    location: 'Tòa B - Tầng 2',
    size: 60,
    type: 'Hội thảo Multimedia',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R3',
    name: 'Giảng Đường 101',
    location: 'Tòa A - Tầng 1',
    size: 100,
    type: 'Giảng đường lớn',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R4',
    name: 'Phòng Lab Vi Mạch 502',
    location: 'Tòa C - Tầng 5',
    size: 25,
    type: 'Thực hành phần cứng',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R5',
    name: 'Phòng Lab 305 - IoT & Robotics',
    location: 'Tòa B - Tầng 3',
    size: 35,
    type: 'Thực hành IoT',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R6',
    name: 'Hội Trường Trực Tuyến VIP',
    location: 'Tòa Central - Tầng 6',
    size: 120,
    type: 'Hội thảo trực tuyến',
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  },
  {
    id: 'R7',
    name: 'Phòng Học Nhóm Co-Working 102',
    location: 'Thư viện - Tầng 1',
    size: 15,
    type: 'Thảo luận nhóm',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
    status: 'Available',
    version: 1,
    bookings: []
  }
];

export const INITIAL_USERS_DB: UserAccount[] = [
  {
    id: 'u1',
    email: 'phuong.tran@edu.vn',
    password: '123',
    name: 'Trần Thu Phương',
    role: 'Giảng viên',
    studentId: 'GV-202601',
    department: 'Khoa Công Nghệ Thông Tin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
  },
  {
    id: 'u2',
    email: 'sinhvien@edu.vn',
    password: '123',
    name: 'Nguyễn Văn A',
    role: 'Sinh viên',
    studentId: 'SV-202602',
    department: 'Khoa Hệ Thống Thông Tin',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop',
  }
];

export const TIME_SLOTS: string[] = [
  // Ca Sáng
  '07:00 - 08:30',
  '08:30 - 10:00',
  '10:00 - 11:30',
  // Ca Chiều
  '12:30 - 14:00',
  '14:00 - 15:30',
  '15:30 - 17:00',
  // Ca Tối
  '17:30 - 19:00',
  '19:00 - 20:30'
];