// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  StyleSheet,
  ListRenderItem,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useBooking, Room } from '../context/BookingContext';
import { TIME_SLOTS } from '../data/mockData';
import { RootTabParamList } from '../navigation/AppNavigator';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DateOption {
  dateStr: string;
  displayStr: string;
  dayOfWeek: string;
}

type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Trang chủ'>;

type StatusFilter = 'ALL' | 'AVAILABLE' | 'BOOKED';
type SizeFilter = 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE';

const getNextDays = (): DateOption[] => {
  const days: DateOption[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const displayStr = i === 0 ? 'Hôm nay' : `${d.getDate()}/${d.getMonth() + 1}`;
    days.push({
      dateStr,
      displayStr,
      dayOfWeek: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
    });
  }
  return days;
};

// Kiểm tra xem khung giờ chọn có trôi qua so với thời gian hiện tại không
const isSlotPast = (dateStr: string, slotStr: string): boolean => {
  try {
    const timeParts = slotStr.split('-');
    const startTimeStr = timeParts[0]?.trim();
    if (!startTimeStr) return false;

    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);

    const slotTime = new Date(year, month - 1, day, hours, minutes, 0);
    return slotTime < new Date();
  } catch {
    return false;
  }
};

// Component thẻ phòng kèm Animation Scale & FadeIn khi load
const RoomCardItem = React.memo(
  ({
    item,
    available,
    onPressBook,
  }: {
    item: Room;
    available: boolean;
    onPressBook: () => void;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.roomCard}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.roomImage} />
            {item.type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
              </View>
            )}

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'Maintenance'
                      ? '#FEE2E2'
                      : available
                      ? '#DCFCE7'
                      : '#FEF3C7',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.status === 'Maintenance'
                        ? '#DC2626'
                        : available
                        ? '#16A34A'
                        : '#D97706',
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === 'Maintenance'
                        ? '#DC2626'
                        : available
                        ? '#15803D'
                        : '#D97706',
                  },
                ]}
              >
                {item.status === 'Maintenance'
                  ? 'Bảo trì'
                  : available
                  ? 'Sẵn sàng'
                  : 'Đã có người đặt'}
              </Text>
            </View>
          </View>

          <View style={styles.roomContent}>
            <Text style={styles.roomName}>{item.name}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={14} color="#64748B" />
                <Text style={styles.infoText}>
                  Sức chứa: <Text style={styles.boldText}>{item.size}</Text> người
                </Text>
              </View>
            </View>

            {/* Nút bấm Đặt Phòng với hiệu ứng Scale */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                disabled={!available || item.status === 'Maintenance'}
                style={[
                  styles.bookBtn,
                  (!available || item.status === 'Maintenance') && styles.bookBtnDisabled,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPressBook}
                activeOpacity={0.9}
              >
                <Text style={styles.bookBtnText}>
                  {item.status === 'Maintenance'
                    ? 'Đang bảo trì'
                    : available
                    ? 'Đặt Phòng Ngay'
                    : 'Đã Có Người Đặt Ca Này'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  }
);

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const bookingData = useBooking();
  const { rooms = [], processBookingTransaction, user } = bookingData;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Bộ lọc trạng thái & sức chứa
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<SizeFilter>('ALL');

  const availableDates = useMemo(() => getNextDays(), []);
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].dateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Kích hoạt LayoutAnimation khi thay đổi lựa chọn
  const triggerLayoutAnimation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleSelectDate = (dateStr: string) => {
    triggerLayoutAnimation();
    setSelectedDate(dateStr);
    if (isSlotPast(dateStr, selectedTimeSlot)) {
      const firstValidSlot = TIME_SLOTS.find((s) => !isSlotPast(dateStr, s));
      if (firstValidSlot) setSelectedTimeSlot(firstValidSlot);
    }
  };

  const handleSelectTimeSlot = (slot: string) => {
    triggerLayoutAnimation();
    setSelectedTimeSlot(slot);
  };

  const handleSelectStatusFilter = (id: StatusFilter) => {
    triggerLayoutAnimation();
    setSelectedStatusFilter(id);
  };

  const handleSelectSizeFilter = (id: SizeFilter) => {
    triggerLayoutAnimation();
    setSelectedSizeFilter(id);
  };

  // Nhóm các khung giờ thành cặp 2 item để cuộn ngang 2 dòng
  const pairedTimeSlots = useMemo(() => {
    const pairs: string[][] = [];
    for (let i = 0; i < TIME_SLOTS.length; i += 2) {
      pairs.push(TIME_SLOTS.slice(i, i + 2));
    }
    return pairs;
  }, []);

  // Kiểm tra phòng có trống ở ngày + khung giờ được chọn hay không
  const isSlotAvailable = (room: Room, dateStr: string, slotStr: string): boolean => {
    if (room.status === 'Maintenance') return false;

    if (!room.bookings || !Array.isArray(room.bookings)) return true;

    const isBooked = room.bookings.some((b: any) => {
      const matchDate = String(b.date).trim() === String(dateStr).trim();
      const matchSlot = String(b.timeSlot || b.time_slot).trim() === String(slotStr).trim();
      const isNotCancelled = b.status !== 'Đã hủy' && b.status !== 'Cancelled';

      return matchDate && matchSlot && isNotCancelled;
    });

    return !isBooked;
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchSearch =
        room.name.toLowerCase().includes(searchText.toLowerCase()) ||
        room.location.toLowerCase().includes(searchText.toLowerCase()) ||
        (room.type && room.type.toLowerCase().includes(searchText.toLowerCase()));

      const available = isSlotAvailable(room, selectedDate, selectedTimeSlot);
      const roomSize = typeof room.size === 'number' ? room.size : parseInt(room.size || '0', 10);

      let matchStatus = true;
      if (selectedStatusFilter === 'AVAILABLE') matchStatus = available;
      if (selectedStatusFilter === 'BOOKED') matchStatus = !available;

      let matchSize = true;
      if (selectedSizeFilter === 'SMALL') matchSize = roomSize < 30;
      if (selectedSizeFilter === 'MEDIUM') matchSize = roomSize >= 30 && roomSize <= 60;
      if (selectedSizeFilter === 'LARGE') matchSize = roomSize > 60;

      return matchSearch && matchStatus && matchSize;
    });
  }, [rooms, searchText, selectedStatusFilter, selectedSizeFilter, selectedDate, selectedTimeSlot]);

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !user || isSubmitting) return;

    if (isSlotPast(selectedDate, selectedTimeSlot)) {
      Alert.alert('❌ Thông báo', 'Khung giờ này đã trôi qua. Vui lòng chọn khung giờ khác.');
      return;
    }

    const canBook = isSlotAvailable(selectedRoom, selectedDate, selectedTimeSlot);
    if (!canBook) {
      Alert.alert(
        '❌ Khung giờ đã bị đặt',
        'Phòng này vào khung giờ bạn chọn đã có người khác đăng ký. Vui lòng chọn khung giờ hoặc phòng khác!'
      );
      setSelectedRoom(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await processBookingTransaction(
        selectedRoom.id,
        selectedDate,
        selectedTimeSlot,
        user.name || user.email,
        user.role
      );

      setSelectedRoom(null);

      if (result.success) {
        Alert.alert('🎉 Đặt phòng thành công!', 'Vui lòng kiểm tra lịch sử đặt phòng.', [
          { text: 'Xem Lịch Sử', onPress: () => navigation.navigate('Đã đặt') },
          { text: 'Đóng', style: 'cancel' },
        ]);
      } else {
        Alert.alert('❌ Thông báo', result.errorMessage || 'Đặt phòng thất bại!', [{ text: 'Đồng ý' }]);
      }
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoomCard: ListRenderItem<Room> = ({ item }) => {
    const available = isSlotAvailable(item, selectedDate, selectedTimeSlot);
    return (
      <RoomCardItem
        item={item}
        available={available}
        onPressBook={() => setSelectedRoom(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerHome}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{
              uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
            }}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.welcomeText}>Xin chào 👋</Text>
            <Text style={styles.userNameHeader}>{user?.name || 'Người dùng'}</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Ionicons name="school" size={12} color="#2563EB" />
          <Text style={styles.roleBadgeText}>{user?.role || 'Thành viên'}</Text>
        </View>
      </View>

      {/* Tìm kiếm */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm phòng, vị trí, loại phòng..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={(text) => {
            triggerLayoutAnimation();
            setSearchText(text);
          }}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerLayoutAnimation();
              setSearchText('');
            }}
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <>
            {/* 1. Chọn Ngày */}
            <Text style={styles.filterTitle}>1. Chọn ngày sử dụng</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={availableDates}
              keyExtractor={(i) => i.dateStr}
              style={{ paddingLeft: 16, marginBottom: 12 }}
              renderItem={({ item }) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.dateChip, isSelected && styles.dateChipActive]}
                    onPress={() => handleSelectDate(item.dateStr)}
                  >
                    <Text style={[styles.dateSubText, isSelected && styles.textWhite]}>{item.dayOfWeek}</Text>
                    <Text style={[styles.dateMainText, isSelected && styles.textWhite]}>{item.displayStr}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* 2. Chọn Khung Giờ */}
            <Text style={styles.filterTitle}>2. Chọn khung giờ</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={pairedTimeSlots}
              keyExtractor={(_, index) => `pair-${index}`}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
              style={{ marginBottom: 14 }}
              renderItem={({ item: pair }) => (
                <View style={{ flexDirection: 'column' }}>
                  {pair.map((slot) => {
                    const isPast = isSlotPast(selectedDate, slot);
                    const isSelected = selectedTimeSlot === slot && !isPast;

                    return (
                      <TouchableOpacity
                        key={slot}
                        disabled={isPast}
                        activeOpacity={0.7}
                        style={[
                          styles.compactSlotChip,
                          isSelected && styles.compactSlotChipActive,
                          isPast && styles.compactSlotChipDisabled,
                        ]}
                        onPress={() => handleSelectTimeSlot(slot)}
                      >
                        <Ionicons
                          name={isPast ? 'lock-closed' : isSelected ? 'time' : 'time-outline'}
                          size={13}
                          color={isPast ? '#A1A1AA' : isSelected ? '#FFFFFF' : '#3B82F6'}
                          style={{ marginRight: 5 }}
                        />
                        <Text
                          style={[
                            styles.compactSlotText,
                            isSelected && styles.textWhite,
                            isPast && styles.compactSlotTextDisabled,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />

            {/* 3. Bộ Lọc Danh Sách */}
            <Text style={styles.filterTitle}>3. Lọc danh sách</Text>

            {/* Trạng thái */}
            <View style={styles.filterRowContainer}>
              <Text style={styles.subFilterLabel}>Trạng thái:</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'AVAILABLE', label: 'Phòng trống' },
                  { id: 'BOOKED', label: 'Đã được đặt' },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedStatusFilter === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.filterTag, isSelected && styles.filterTagActive]}
                      onPress={() => handleSelectStatusFilter(item.id as StatusFilter)}
                    >
                      <Text style={isSelected ? styles.textWhite : styles.filterTagText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Sức chứa */}
            <View style={[styles.filterRowContainer, { marginBottom: 16 }]}>
              <Text style={styles.subFilterLabel}>Sức chứa:</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'SMALL', label: '< 30 chỗ' },
                  { id: 'MEDIUM', label: '30 - 60 chỗ' },
                  { id: 'LARGE', label: '> 60 chỗ' },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedSizeFilter === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.filterTag, isSelected && styles.filterTagActive]}
                      onPress={() => handleSelectSizeFilter(item.id as SizeFilter)}
                    >
                      <Text style={isSelected ? styles.textWhite : styles.filterTagText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách phòng ({filteredRooms.length})</Text>
            </View>
          </>
        }
      />

      {/* Modal Xác Nhận */}
      <Modal visible={!!selectedRoom} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác Nhận Đặt Phòng</Text>
              <TouchableOpacity disabled={isSubmitting} onPress={() => setSelectedRoom(null)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedRoom && (
              <View>
                <Text style={styles.modalRoomName}>{selectedRoom.name}</Text>

                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalDetailText}>
                    📍 <Text style={styles.boldText}>Địa điểm:</Text> {selectedRoom.location}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    👥 <Text style={styles.boldText}>Sức chứa:</Text> {selectedRoom.size} người
                  </Text>
                  <Text style={styles.modalDetailText}>
                    📅 <Text style={styles.boldText}>Ngày sử dụng:</Text> {selectedDate}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    ⏰ <Text style={styles.boldText}>Khung giờ:</Text> {selectedTimeSlot}
                  </Text>
                  <Text style={styles.modalDetailText}>
                    👤 <Text style={styles.boldText}>Người đăng ký:</Text> {user?.name || 'Chưa xác định'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                  <TouchableOpacity
                    disabled={isSubmitting}
                    style={[styles.modalBtn, { backgroundColor: '#F1F5F9', flex: 1, marginRight: 8 }]}
                    onPress={() => setSelectedRoom(null)}
                  >
                    <Text style={{ color: '#475569', fontWeight: 'bold' }}>Hủy bỏ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={isSubmitting}
                    style={[
                      styles.modalBtn,
                      { backgroundColor: isSubmitting ? '#94A3B8' : '#2563EB', flex: 1 },
                    ]}
                    onPress={handleConfirmBooking}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                      {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  headerHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 16,
    marginBottom: 8,
  },
  dateChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dateSubText: {
    fontSize: 11,
    color: '#64748B',
  },
  dateMainText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },

  /* CHIP KHUNG GIỜ */
  compactSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactSlotChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  compactSlotChipDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  compactSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  compactSlotTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  /* CHIP BỘ LỌC */
  filterRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginBottom: 8,
  },
  subFilterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    width: 65,
  },
  filterTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTagActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  sectionHeader: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  roomCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 140,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  statusBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  roomContent: {
    padding: 14,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  boldText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },

  bookBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  bookBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textWhite: {
    color: '#FFF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalRoomName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 10,
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalDetailText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  modalBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
});