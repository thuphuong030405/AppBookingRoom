import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBooking } from '../context/BookingContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, myBookings = [], logout, updateUserProfile } = useBooking();

  const activeBookingsCount = myBookings.filter((b) => b.status !== 'Đã hủy').length;
  const cancelledBookingsCount = myBookings.filter((b) => b.status === 'Đã hủy').length;

  // Modal State cho chỉnh sửa thông tin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cập nhật lại state form khi user context thay đổi
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setStudentId(user.studentId || '');
      setDepartment(user.department || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const profileCardAnim = useRef(new Animated.Value(40)).current;
  const statsAnim = useRef(new Animated.Value(40)).current;
  const menuAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(120, [
        Animated.spring(profileCardAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(statsAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(menuAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, profileCardAnim, statsAnim, menuAnim]);

  // Xử lý lưu hồ sơ mới vào Supabase
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Họ và tên không được để trống!');
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserProfile({
      name: name.trim(),
      studentId: studentId.trim(),
      department: department.trim(),
      avatar: avatar.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      Alert.alert('Thành công 🎉', 'Đã cập nhật thông tin cá nhân của bạn!');
      setIsEditModalOpen(false);
    } else {
      Alert.alert('Lỗi', res.errorMessage || 'Không thể lưu thông tin!');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Top Gradient Banner Header */}
        <LinearGradient
          colors={['#1E3A8A', '#2563EB', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topBanner}
        >
          <View style={styles.bannerHeader}>
            <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
            <TouchableOpacity
              style={styles.settingsBtn}
              activeOpacity={0.8}
              onPress={() => setIsEditModalOpen(true)}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {/* Profile Card */}
          <Animated.View
            style={[
              styles.profileCard,
              { transform: [{ translateY: profileCardAnim }] },
            ]}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={[
                  styles.roleBadgeIcon,
                  user?.role === 'Giảng viên' ? styles.bgTeacher : styles.bgStudent,
                ]}
                onPress={() => setIsEditModalOpen(true)}
              >
                <Ionicons
                  name={user?.role === 'Giảng viên' ? 'school' : 'person'}
                  size={14}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.name || 'Người dùng AppBooking'}</Text>
            <Text style={styles.userIdText}>{user?.studentId || 'Mã SV/GV: Chưa cập nhật'}</Text>

            <View style={styles.roleTag}>
              <Ionicons
                name="sparkles"
                size={12}
                color="#2563EB"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleTagText}>{user?.role || 'Sinh viên'}</Text>
            </View>

            <View style={styles.divider} />

            {/* User Meta Data */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="mail-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.infoText}>
                  {user?.email || 'chua_cap_nhat@edu.vn'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="business-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.infoText}>
                  {user?.department || 'Khoa Công Nghệ Thông Tin'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View
            style={[
              styles.sectionCard,
              { transform: [{ translateY: statsAnim }] },
            ]}
          >
            <Text style={styles.sectionHeader}>THỐNG KÊ ĐẶT PHÒNG</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.statNumber}>{myBookings.length}</Text>
                <Text style={styles.statLabel}>Tổng lượt</Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="#16A34A" />
                </View>
                <Text style={[styles.statNumber, { color: '#16A34A' }]}>
                  {activeBookingsCount}
                </Text>
                <Text style={styles.statLabel}>Hiệu lực</Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                </View>
                <Text style={[styles.statNumber, { color: '#DC2626' }]}>
                  {cancelledBookingsCount}
                </Text>
                <Text style={styles.statLabel}>Đã hủy</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Menu */}
          <Animated.View
            style={[
              styles.sectionCard,
              { transform: [{ translateY: menuAnim }] },
            ]}
          >
            <Text style={styles.sectionHeader}>TÙY CHỌN TÀI KHOẢN</Text>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => setIsEditModalOpen(true)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="create-outline" size={18} color="#2563EB" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Chỉnh Sửa Hồ Sơ</Text>
                <Text style={styles.actionSub}>Cập nhật tên, mã sinh viên và khoa</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="notifications-outline" size={18} color="#16A34A" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Thông Báo Đặt Phòng</Text>
                <Text style={styles.actionSub}>
                  Nhận thông báo nhắc lịch học & phòng lab
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={logout}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={[styles.actionTitle, { color: '#DC2626' }]}>
                  Đăng Xuất
                </Text>
                <Text style={styles.actionSub}>
                  Đăng xuất tài khoản khỏi thiết bị
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* 🚀 MODAL CHỈNH SỬA HỒ SƠ ĐƯỢC THIẾT KẾ ĐẸP MẮT & HIỆN ĐẠI */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContentContainer}>
            {/* Thanh kéo vuốt Modal */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                <Text style={styles.modalSubtitle}>Cập nhật thông tin tài khoản cá nhân</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
              {/* Avatar Preview Box */}
              <View style={styles.avatarPreviewContainer}>
                <Image
                  source={{
                    uri:
                      avatar.trim() ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                  }}
                  style={styles.avatarPreview}
                />
                <View style={styles.avatarBadgeBox}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </View>

              {/* Input: Họ và Tên */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và Tên</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập họ và tên..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Input: Mã Số Sinh Viên / Giảng Viên */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mã Số Sinh Viên / Giảng Viên</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="Ví dụ: SV-202601..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Input: Khoa / Bộ Môn */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Khoa / Bộ Môn</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Khoa Công Nghệ Thông Tin..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Input: URL Avatar */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Đường Dẫn Ảnh Đại Diện (URL)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="image-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={avatar}
                    onChangeText={setAvatar}
                    placeholder="https://..."
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsContainer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setIsEditModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.8}
                  onPress={handleSaveProfile}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveBtn}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  topBanner: {
    height: 150,
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Profile Card Styles */
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: -45,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  roleBadgeIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bgTeacher: { backgroundColor: '#7C3AED' },
  bgStudent: { backgroundColor: '#2563EB' },

  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userIdText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleTagText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  infoContainer: {
    width: '100%',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },

  /* Section Card Shared Styles */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  /* Stats Section */
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  verticalLine: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },

  /* Menu Actions */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* 🎨 GIAO DIỆN MODAL ĐƯỢC LÀM MỚI BẮT MẮT */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 18,
  },
  avatarPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  avatarBadgeBox: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    marginBottom: 10,
  },
  cancelBtn: {
    width: 100,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});