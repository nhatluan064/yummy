// Script để tạo tài khoản Admin trong Firebase Auth
// Chạy script này trong Firebase Console hoặc Node.js environment

// Thay thế config này bằng config thực tế từ firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔧 Firebase Config:', firebaseConfig);

// Hướng dẫn tạo tài khoản admin thủ công:
// 1. Vào Firebase Console → Authentication → Users
// 2. Click "Add user"
// 3. Nhập email: admin@restaurant.com
// 4. Nhập password mạnh (tối thiểu 6 ký tự)
// 5. Copy UID từ user vừa tạo
// 6. Thay thế "ADMIN_UID_HERE" trong firestore.rules bằng UID đó

console.log('📋 HƯỚNG DẪN TẠO TÀI KHOẢN ADMIN:');
console.log('1. Vào https://console.firebase.google.com/');
console.log('2. Chọn project của bạn');
console.log('3. Vào Authentication → Users');
console.log('4. Click "Add user"');
console.log('5. Email: admin@restaurant.com');
console.log('6. Password: [mật khẩu mạnh, tối thiểu 6 ký tự]');
console.log('7. Sau khi tạo, copy UID của user');
console.log('8. Thay thế "ADMIN_UID_HERE" trong firestore.rules bằng UID đó');
console.log('9. Deploy Firestore rules: firebase deploy --only firestore:rules');
console.log('');
console.log('⚠️  CHÚ Ý: Chỉ có user với UID này mới có quyền chỉnh sửa dữ liệu!');
console.log('🔒 Các user khác chỉ có thể đọc dữ liệu.');