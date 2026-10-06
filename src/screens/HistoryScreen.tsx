// src/screens/HistoryScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
  ListRenderItem,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking, Booking } from '../context/BookingContext';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'ALL' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED';

// Component Thẻ Đặt Phòng kèm hiệu ứng xuất hiện (Animated Item Card)
const AnimatedBookingCard = ({
  item,
  targetRoom,
  isCancelled,
  isCompleted,
  handleCancel,
}: {
  item: Booking;
  targetRoom: any;
  isCancelled: boolean;
  isCompleted: boolean;
  handleCancel: (id: string) => void;
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(15)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  const roomName = targetRoom?.name || 'Phòng học / Phòng Lab';
  const roomLocation = targetRoom?.location || 'Chưa cập nhật địa điểm';
  const roomSize = targetRoom?.size ? `${targetRoom.size} người` : 'N/A';
  const roomImage =
    targetRoom?.image ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300';

  let statusText = item.status;
  let statusBgColor = '#F0FDF4';
  let statusColor = '#16A34A';
  let statusIcon = 'checkmark-circle';

  if (isCancelled) {
    statusText = 'Đã hủy';
    statusBgColor = '#FEF2F2';
    statusColor = '#DC2626';
    statusIcon = 'close-circle';
  } else if (isCompleted) {
    statusText = 'Đã hoàn thành';
    statusBgColor = '#F1F5F9';
    statusColor = '#475569';
    statusIcon = 'checkmark-done-circle';
  } else {
    statusText = 'Sắp tới';
    statusBgColor = '#EFF6FF';
    statusColor = '#2563EB';
    statusIcon = 'time';
  }

  return (
    <Animated.View
      style={[
        styles.bookingCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <View style={styles.cardMainInfo}>
        <Image source={{ uri: roomImage }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.roomName} numberOfLines={1}>
            {roomName}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.subText} numberOfLines={1}>
              {roomLocation}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={14} color="#64748B" />
            <Text style={styles.subText}>{roomSize}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#2563EB" />
            <Text style={[styles.subText, styles.highlightText]}>
              {item.date} | {item.timeSlot}
            </Text>
          </View>

          {item.userName && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#64748B" />
              <Text style={styles.subText} numberOfLines={1}>
                Người đặt: {item.userName} {item.userRole ? `(${item.userRole})` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <Ionicons
            name={statusIcon as any}
            size={14}
            color={statusColor}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {!isCancelled && !isCompleted && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Hủy đặt phòng</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const { myBookings = [], rooms = [], cancelBooking, fetchData } = useBooking();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Chuyển Tab có thêm Animation mượt mà
  const changeTab = (tab: TabType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  // Hàm kiểm tra lượt đặt đã hoàn thành hay chưa
  const isBookingCompleted = useCallback((item: Booking): boolean => {
    if (item.status === 'Đã hủy') return false;

    try {
      const timeParts = item.timeSlot.split('-');
      const endTimeStr = timeParts[1]?.trim() || '23:59';

      const [hours, minutes] = endTimeStr.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = (minutes || '00').padStart(2, '0');

      const bookingEnd = new Date(`${item.date}T${formattedHours}:${formattedMinutes}:00`);
      const now = new Date();

      if (isNaN(bookingEnd.getTime())) {
        return false;
      }

      return bookingEnd < now;
    } catch {
      return false;
    }
  }, []);

  // Hàm chuyển đổi Date + timeSlot thành timestamp để sắp xếp
  const getBookingTimestamp = useCallback((item: Booking): number => {
    try {
      const startTimeStr = item.timeSlot.split('-')[0]?.trim() || '00:00';
      const [hours, minutes] = startTimeStr.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = (minutes || '00').padStart(2, '0');

      const startTime = new Date(`${item.date}T${formattedHours}:${formattedMinutes}:00`);
      return isNaN(startTime.getTime()) ? 0 : startTime.getTime();
    } catch {
      return 0;
    }
  }, []);

  // Lọc và SẮP XẾP danh sách đặt phòng từ SỚM lên TRÊN
  const filteredBookings = useMemo(() => {
    const list = myBookings.filter((item) => {
      const isCancelled = item.status === 'Đã hủy';
      const isCompleted = isBookingCompleted(item);

      if (activeTab === 'COMPLETED') return !isCancelled && isCompleted;
      if (activeTab === 'UPCOMING') return !isCancelled && !isCompleted;
      if (activeTab === 'CANCELLED') return isCancelled;
      return true;
    });

    // Sắp xếp thời gian tăng dần (sớm lên trên)
    return list.sort((a, b) => getBookingTimestamp(a) - getBookingTimestamp(b));
  }, [myBookings, activeTab, isBookingCompleted, getBookingTimestamp]);

  // Đếm số lượng theo trạng thái
  const counts = useMemo(() => {
    let completed = 0;
    let upcoming = 0;
    let cancelled = 0;

    myBookings.forEach((item) => {
      if (item.status === 'Đã hủy') {
        cancelled++;
      } else if (isBookingCompleted(item)) {
        completed++;
      } else {
        upcoming++;
      }
    });

    return {
      all: myBookings.length,
      completed,
      upcoming,
      cancelled,
    };
  }, [myBookings, isBookingCompleted]);

  // Xử lý Hủy đặt phòng
  const handleCancel = (id: string) => {
    Alert.alert('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy lượt đặt phòng này?', [
      { text: 'Quay lại', style: 'cancel' },
      {
        text: 'Xác nhận hủy',
        style: 'destructive',
        onPress: async () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          await cancelBooking(id);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderBookingCard: ListRenderItem<Booking> = ({ item }) => {
    const targetRoom = rooms.find((r) => r.id === item.roomId);
    const isCancelled = item.status === 'Đã hủy';
    const isCompleted = isBookingCompleted(item);

    return (
      <AnimatedBookingCard
        item={item}
        targetRoom={targetRoom}
        isCancelled={isCancelled}
        isCompleted={isCompleted}
        handleCancel={handleCancel}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Sử Đặt Phòng</Text>
        <Text style={styles.headerSub}>
          Quản lý các lượt đặt phòng học & phòng Lab
        </Text>
      </View>

      {/* Thanh chuyển đổi 4 Tab */}
      <View style={styles.tabContainer}>
        {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as TabType[]).map((tab) => {
          const labels: Record<TabType, string> = {
            ALL: `Tất cả (${counts.all})`,
            UPCOMING: `Sắp tới (${counts.upcoming})`,
            COMPLETED: `Đã xong (${counts.completed})`,
            CANCELLED: `Đã hủy (${counts.cancelled})`,
          };

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => changeTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Danh sách lượt đặt phòng */}
      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={42} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'UPCOMING'
              ? 'Không có lịch đặt phòng nào sắp tới.'
              : activeTab === 'COMPLETED'
              ? 'Chưa có lịch đặt phòng nào đã hoàn thành.'
              : activeTab === 'CANCELLED'
              ? 'Chưa có lịch đặt phòng nào bị hủy.'
              : 'Bạn chưa thực hiện lượt đặt phòng nào.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderBookingCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* Tabs Navigation */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 3,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  /* List & Cards */
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    paddingTop: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMainInfo: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  highlightText: {
    color: '#2563EB',
    fontWeight: '600',
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});