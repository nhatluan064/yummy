// === BOOKING.JS - QUẢN LÝ ĐẶT BÀN ===

// Import Firebase modules if running in module context
let db = null;
let addDoc = null;
let collection = null;
let getDocs = null;
let deleteDoc = null;
let doc = null;
let setDoc = null;
let orderBy = null;
let query = null;

// Initialize Firebase connection if available
if (typeof window !== 'undefined' && window.firebase) {
  // Firebase already initialized elsewhere
} else {
  // Will be initialized by the page that includes this script
}

class BookingManager {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupBookingForm();
      this.setupDateTimeValidation();
      this.initializeFirebase();
    });
  }

  async initializeFirebase() {
    try {
      // Firebase should be initialized by the including page
      if (typeof window !== 'undefined' && window.firebaseApp) {
        const { getFirestore, collection: fbCollection, addDoc: fbAddDoc, getDocs: fbGetDocs, 
                deleteDoc: fbDeleteDoc, doc: fbDoc, setDoc: fbSetDoc, orderBy: fbOrderBy, 
                query: fbQuery } = await import("https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js");
        
        db = getFirestore(window.firebaseApp);
        collection = fbCollection;
        addDoc = fbAddDoc;
        getDocs = fbGetDocs;
        deleteDoc = fbDeleteDoc;
        doc = fbDoc;
        setDoc = fbSetDoc;
        orderBy = fbOrderBy;
        query = fbQuery;
      }
    } catch (error) {
      console.warn('Firebase not available, using localStorage fallback:', error);
    }
  }

  setupBookingForm() {
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBookingSubmit(e.target);
      });
    }
  }

  setupDateTimeValidation() {
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    if (dateInput) {
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
      
      dateInput.addEventListener('change', () => {
        this.validateDateTime();
      });
    }

    if (timeInput) {
      timeInput.addEventListener('change', () => {
        this.validateDateTime();
      });
    }
  }

  validateDateTime() {
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    
    if (!dateInput || !timeInput) return true;

    const selectedDate = new Date(dateInput.value);
    const selectedTime = timeInput.value;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // If selected date is today, check if time is in the future
    if (dateInput.value === today && selectedTime) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (selectedTime < currentTime) {
        Utils.showNotification("Không thể đặt bàn trong quá khứ!", 'error');
        timeInput.setCustomValidity("Thời gian không hợp lệ");
        return false;
      }
    }

    // Check restaurant hours (10:00 - 22:00)
    if (selectedTime) {
      const [hours] = selectedTime.split(':').map(Number);
      if (hours < 10 || hours > 22) {
        Utils.showNotification("Nhà hàng mở cửa từ 10:00 đến 22:00", 'warning');
        timeInput.setCustomValidity("Ngoài giờ mở cửa");
        return false;
      }
    }

    timeInput.setCustomValidity("");
    return true;
  }

  async handleBookingSubmit(form) {
    if (!Utils.validateForm(form)) {
      Utils.showNotification("Vui lòng điền đầy đủ thông tin!", 'error');
      return;
    }

    if (!this.validateDateTime()) {
      return;
    }

    const formData = new FormData(form);
    const bookingData = {
      id: Date.now(),
      name: formData.get('name') || form.name.value,
      phone: formData.get('phone') || form.phone.value,
      email: formData.get('email') || form.email.value,
      date: formData.get('date') || form.date.value,
      time: formData.get('time') || form.time.value,
      people: formData.get('people') || form.people.value,
      notes: formData.get('notes') || form.notes.value,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Check if table is available
    const isAvailable = await this.isTableAvailable(bookingData.date, bookingData.time, bookingData.people);
    if (isAvailable) {
      await this.saveBooking(bookingData);
      this.showBookingSuccess(bookingData);
      form.reset();
    } else {
      await this.showAlternativeSlots(bookingData.date, bookingData.people);
    }
  }

  async isTableAvailable(date, time, people) {
    const bookings = await this.loadBookings();
    const requestedDateTime = new Date(`${date}T${time}`);
    
    // Check for conflicts (1 hour buffer)
    const conflicts = bookings.filter(booking => {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
      const timeDiff = Math.abs(requestedDateTime - bookingDateTime);
      
      return booking.status !== 'cancelled' && 
             timeDiff < 60 * 60 * 1000 && // 1 hour in milliseconds
             booking.people >= people;
    });

    return conflicts.length === 0;
  }

  async showAlternativeSlots(date, people) {
    const alternatives = await this.findAlternativeSlots(date, people);
    
    if (alternatives.length > 0) {
      let message = "Thời gian này đã có người đặt. Các khung giờ khác:\n";
      alternatives.forEach(slot => {
        message += `• ${slot.time}\n`;
      });
      
      Utils.showNotification(message, 'warning');
    } else {
      Utils.showNotification(
        "Ngày này đã hết chỗ. Vui lòng chọn ngày khác!", 
        'error'
      );
    }
  }

  async findAlternativeSlots(date, people) {
    const alternatives = [];
    
    // Generate available time slots (10:00 - 21:00, every hour)
    for (let hour = 10; hour <= 21; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      const isAvailable = await this.isTableAvailable(date, time, people);
      if (isAvailable) {
        alternatives.push({ time, available: true });
      }
    }
    
    return alternatives.slice(0, 3); // Return first 3 alternatives
  }

  async saveBooking(bookingData) {
    try {
      if (db && addDoc && collection) {
        // Save to Firebase
        const bookingsCollectionRef = collection(db, "bookings");
        const docRef = await addDoc(bookingsCollectionRef, {
          ...bookingData,
          createdAt: new Date()
        });
        console.log("Booking saved to Firebase with ID:", docRef.id);
      } else {
        // Fallback to localStorage
        const bookings = Utils.loadFromStorage('bookings', []);
        bookings.push(bookingData);
        Utils.saveToStorage('bookings', bookings);
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      // Fallback to localStorage
      const bookings = Utils.loadFromStorage('bookings', []);
      bookings.push(bookingData);
      Utils.saveToStorage('bookings', bookings);
    }
  }

  showBookingSuccess(bookingData) {
    const message = `Đặt bàn thành công!
    
Thông tin đặt bàn:
• Tên: ${bookingData.name}
• Ngày: ${new Date(bookingData.date).toLocaleDateString('vi-VN')}
• Giờ: ${bookingData.time}
• Số người: ${bookingData.people}
• Mã đặt bàn: ${bookingData.id}

Chúng tôi sẽ sớm liên hệ với bạn để xác nhận!`;

    Utils.showNotification(message, 'success');
    
    // Send confirmation email (simulated)
    this.sendConfirmationEmail(bookingData);
  }

  sendConfirmationEmail(bookingData) {
    // In a real application, this would send an actual email
    console.log('Sending confirmation email for booking:', bookingData.id);
    
    // Simulate email sending delay
    setTimeout(() => {
      Utils.showNotification(
        `Email xác nhận đã được gửi đến ${bookingData.email}`, 
        'info'
      );
    }, 2000);
  }

  async loadBookings() {
    try {
      if (db && getDocs && collection) {
        // Load from Firebase
        const bookingsCollectionRef = collection(db, "bookings");
        const querySnapshot = await getDocs(bookingsCollectionRef);
        
        const bookings = [];
        querySnapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        
        return bookings;
      } else {
        // Fallback to localStorage
        return Utils.loadFromStorage('bookings', []);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      return Utils.loadFromStorage('bookings', []);
    }
  }

  // Admin methods for managing bookings
  getBookingsByDate(date) {
    const bookings = this.loadBookings();
    return bookings.filter(booking => booking.date === date);
  }

  updateBookingStatus(bookingId, status) {
    const bookings = Utils.loadFromStorage('bookings', []);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
      bookings[bookingIndex].status = status;
      bookings[bookingIndex].updatedAt = new Date().toISOString();
      Utils.saveToStorage('bookings', bookings);
      
      Utils.showNotification(
        `Cập nhật trạng thái đặt bàn thành công!`, 
        'success'
      );
      
      return true;
    }
    
    return false;
  }

  cancelBooking(bookingId, reason = '') {
    return this.updateBookingStatus(bookingId, 'cancelled');
  }

  confirmBooking(bookingId) {
    return this.updateBookingStatus(bookingId, 'confirmed');
  }
}

// Initialize booking manager
const bookingManager = new BookingManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookingManager;
} else {
  window.BookingManager = BookingManager;
  window.bookingManager = bookingManager;
}