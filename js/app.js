// === APP.JS - CHỨC NĂNG CHUNG ===

// Utility functions
const Utils = {
  formatCurrency: (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount),

  showNotification: (message, type = 'info') => {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },

  validateForm: (formElement) => {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        isValid = false;
      } else {
        field.style.borderColor = '#d1d5db';
      }
    });
    
    return isValid;
  },

  // Save to localStorage
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Load from localStorage
  loadFromStorage: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }
};

// Navigation functionality
const Navigation = {
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupNavigation();
    });
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");

    // Handle navigation clicks
    document.body.addEventListener("click", (e) => {
      const navLink = e.target.closest(".nav-link");
      if (navLink) {
        e.preventDefault();
        const pageId = navLink.dataset.page;
        if (pageId) this.showPage(pageId);
      }
    });
  },

  showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const navLinks = document.querySelectorAll(".nav-link");

    pages.forEach((page) => page.classList.remove("active"));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.page === pageId) {
        link.classList.add("active");
      }
    });
    
    window.scrollTo(0, 0);
  }
};

// Initialize navigation
Navigation.init();

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils, Navigation };
} else {
  window.Utils = Utils;
  window.Navigation = Navigation;
}