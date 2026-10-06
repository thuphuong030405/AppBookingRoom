// src/screens/AuthScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../context/BookingContext';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const TAB_WIDTH = (width - 40 - 8) / 2; // Độ rộng từng tab trong tabContainer

export default function AuthScreen() {
  const { login, register, loginWithGoogle } = useBooking();

  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Trạng thái bổ sung cho Đăng Ký
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'Sinh viên' | 'Giảng viên'>('Sinh viên');
  const [studentId, setStudentId] = useState<string>('');
  const [department, setDepartment] = useState<string>('');

  // Trạng thái ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // --- ANIMATION VALUES ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabPosition = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation xuất hiện ban đầu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Xử lý chuyển Tab với Animation
  const handleTabSwitch = (toLogin: boolean) => {
    if (isLoginTab === toLogin) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoginTab(toLogin);

    Animated.spring(tabPosition, {
      toValue: toLogin ? 0 : TAB_WIDTH,
      useNativeDriver: true,
      friction: 6,
      tension: 50,
    }).start();
  };

  // Hiệu ứng nhún nút bấm
  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    if (isLoginTab) {
      const res = await login(email, password);
      if (!res.success) {
        Alert.alert('Lỗi Đăng Nhập', res.errorMessage || 'Đăng nhập không thành công.');
      }
    } else {
      if (!name.trim() || !studentId.trim() || !department.trim()) {
        Alert.alert('Thông báo', 'Vui lòng nhập Họ tên, Mã số và Khoa / Phòng ban.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Lỗi Mật Khẩu', 'Xác nhận mật khẩu không trùng khớp!');
        return;
      }

      const res = await register({
        email,
        password,
        name,
        role,
        studentId,
        department,
      });

      if (!res.success) {
        Alert.alert('Lỗi Đăng Ký', res.errorMessage || 'Đăng ký không thành công.');
      } else {
        Alert.alert('Thành công', 'Tạo tài khoản thành công!');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (loginWithGoogle) {
        const res = await loginWithGoogle();
        if (!res.success) {
          Alert.alert('Lỗi Google Auth', res.errorMessage || 'Đăng nhập Google thất bại.');
        }
      } else {
        const res = await login('student@edu.vn', '123456');
        if (!res.success) {
          Alert.alert('Đăng nhập Google', 'Đã đăng nhập thành công với tài khoản Google mẫu.');
        }
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể kết nối tới dịch vụ Google.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Logo App */}
            <View style={styles.headerBox}>
              <View style={styles.logoCircle}>
                <Ionicons name="business" size={36} color="#2563EB" />
              </View>
              <Text style={styles.appTitle}>EduSpace Booking</Text>
              <Text style={styles.appSub}>Đặt phòng học & Phòng Lab thông minh</Text>
            </View>

            {/* Thanh Tab Chuyển Đổi Animated */}
            <View style={styles.tabContainer}>
              <Animated.View
                style={[
                  styles.animatedIndicator,
                  {
                    transform: [{ translateX: tabPosition }],
                    width: TAB_WIDTH,
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => handleTabSwitch(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>
                  Đăng Nhập
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => handleTabSwitch(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>
                  Đăng Ký
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Nhập Liệu */}
            <View style={styles.formCard}>
              {!isLoginTab && (
                <>
                  {/* Họ tên */}
                  <Text style={styles.label}>Họ và Tên</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={18} color="#64748B" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  {/* Chức danh */}
                  <Text style={styles.label}>Chức danh / Vai trò</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'Sinh viên' && styles.roleOptionActive,
                      ]}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setRole('Sinh viên');
                      }}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          role === 'Sinh viên' && styles.roleTextActive,
                        ]}
                      >
                        Sinh viên
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'Giảng viên' && styles.roleOptionActive,
                      ]}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setRole('Giảng viên');
                      }}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          role === 'Giảng viên' && styles.roleTextActive,
                        ]}
                      >
                        Giảng viên
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Mã số */}
                  <Text style={styles.label}>
                    {role === 'Giảng viên' ? 'Mã Giảng Viên' : 'Mã Sinh Viên'}
                  </Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="card-outline" size={18} color="#64748B" />
                    <TextInput
                      style={styles.input}
                      placeholder={
                        role === 'Giảng viên' ? 'GV-2026XX' : 'SV-2026XX'
                      }
                      value={studentId}
                      onChangeText={setStudentId}
                    />
                  </View>

                  {/* Khoa / Phòng ban */}
                  <Text style={styles.label}>Khoa / Phòng Ban</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="business-outline" size={18} color="#64748B" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ví dụ: Khoa Công Nghệ Thông Tin"
                      value={department}
                      onChangeText={setDepartment}
                    />
                  </View>
                </>
              )}

              {/* Email */}
              <Text style={styles.label}>Email Trường / Cá Nhân</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="email@edu.vn"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Mật khẩu */}
              <Text style={styles.label}>Mật Khẩu</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Xác nhận mật khẩu (Chỉ hiển thị ở màn Đăng ký) */}
              {!isLoginTab && (
                <>
                  <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Nút Xác Nhận Có Hiệu Ứng Bounce */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <Text style={styles.submitBtnText}>
                    {isLoginTab ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#FFF"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Đường phân cách OR */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>HOẶC</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Nút Đăng nhập Google */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, justifyContent: 'center' },
  headerBox: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  appSub: { fontSize: 13, color: '#64748B', marginTop: 4 },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    position: 'relative',
  },
  animatedIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#2563EB', fontWeight: 'bold' },

  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },

  roleSelector: { flexDirection: 'row', gap: 10 },
  roleOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  roleOptionActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  roleTextActive: { color: '#FFF' },

  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 46,
  },
  googleBtnText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});