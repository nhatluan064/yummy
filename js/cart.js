// === CART.JS - QUẢN LÝ GIỎ HÀNG ===

class CartManager {
  constructor() {
    this.cart = {};
    this.selectedTable = null;
    this.orderType = "dine-in"; // 'dine-in' hoặc 'delivery'
    this.shippingFee = 0;
    this.shippingInfo = {};
    this.sharedManager = window.sharedMenuManager;
    this.menuItems = [];
    this.init();
  }

  init() {
    // Load menu data from shared manager
    this.loadMenuData();

    document.addEventListener("DOMContentLoaded", () => {
      this.setupCartListeners();
      this.loadCartFromStorage();
      this.renderMenu();
      this.renderCart();
    });
  }

  loadMenuData() {
    this.menuItems = this.sharedManager.getMenuData();
  }

  renderMenu() {
    const menuGrid = document.getElementById("order-menu-grid");
    if (!menuGrid) return;

    // Clear existing menu
    menuGrid.innerHTML = "";

    // Group items by category
    const categories = {};
    this.menuItems.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    // Render each category
    Object.entries(categories).forEach(([category, items]) => {
      // Category header
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "category-header";
      categoryHeader.innerHTML = `
        <h3>${category}</h3>
        <span class="category-count">${items.length} món</span>
      `;
      menuGrid.appendChild(categoryHeader);

      // Category items
      items.forEach((item) => {
        const menuCard = document.createElement("div");
        menuCard.className = `menu-card ${
          item.status === "soldout" ? "soldout" : ""
        }`;
        menuCard.dataset.name = item.name;
        menuCard.dataset.price = item.price;
        menuCard.dataset.id = item.id;

        menuCard.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
               onerror="this.src='https://via.placeholder.com/200x150/FF6B35/FFFFFF?text=No+Image'">
          <div class="menu-item-info">
            <h4>${item.name}</h4>
            <p class="item-description">${item.description}</p>
            <div class="item-price">${Utils.formatCurrency(item.price)}</div>
            <div class="item-status">
              ${
                item.status === "available"
                  ? `<span class="available">Còn món (${
                      item.inventory || 0
                    })</span>`
                  : '<span class="soldout">Hết món</span>'
              }
            </div>
            ${
              item.status === "available"
                ? `<button class="add-to-cart-btn btn btn-primary" onclick="cartManager.addToCart('${item.id}')">
                 <i class="fas fa-plus"></i> Thêm vào giỏ
               </button>`
                : '<button class="btn btn-secondary" disabled>Hết món</button>'
            }
          </div>
        `;

        menuGrid.appendChild(menuCard);
      });
    });
  }

  // Filter menu by category (for navigation from menu page)
  filterMenuByCategory(category) {
    const menuGrid = document.getElementById("order-menu-grid");
    if (!menuGrid) return;

    const categoryItems = this.menuItems.filter(
      (item) => item.category === category
    );

    // Clear and render only items from specific category
    menuGrid.innerHTML = "";

    if (categoryItems.length > 0) {
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "category-header";
      categoryHeader.innerHTML = `
        <h3>${category}</h3>
        <span class="category-count">${categoryItems.length} món</span>
        <button class="btn btn-secondary btn-sm" onclick="cartManager.renderMenu()">
          <i class="fas fa-list"></i> Xem tất cả menu
        </button>
      `;
      menuGrid.appendChild(categoryHeader);

      categoryItems.forEach((item) => {
        const menuCard = document.createElement("div");
        menuCard.className = `menu-card ${
          item.status === "soldout" ? "soldout" : ""
        }`;
        menuCard.dataset.name = item.name;
        menuCard.dataset.price = item.price;
        menuCard.dataset.id = item.id;

        menuCard.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
               onerror="this.src='https://via.placeholder.com/200x150/FF6B35/FFFFFF?text=No+Image'">
          <div class="menu-item-info">
            <h4>${item.name}</h4>
            <p class="item-description">${item.description}</p>
            <div class="item-price">${Utils.formatCurrency(item.price)}</div>
            <div class="item-status">
              ${
                item.status === "available"
                  ? `<span class="available">Còn món (${
                      item.inventory || 0
                    })</span>`
                  : '<span class="soldout">Hết món</span>'
              }
            </div>
            ${
              item.status === "available"
                ? `<button class="add-to-cart-btn btn btn-primary" onclick="cartManager.addToCart('${item.id}')">
                 <i class="fas fa-plus"></i> Thêm vào giỏ
               </button>`
                : '<button class="btn btn-secondary" disabled>Hết món</button>'
            }
          </div>
        `;

        menuGrid.appendChild(menuCard);
      });
    }
  }

  setupCartListeners() {
    // Add to cart buttons
    const menuGrid = document.getElementById("order-menu-grid");
    if (menuGrid) {
      menuGrid.addEventListener("click", (e) => {
        const addButton = e.target.closest(".add-to-cart-btn");
        if (addButton) {
          this.addToCart(addButton);
        }
      });
    }

    // Cart actions
    const cartItems = document.getElementById("cart-items");
    if (cartItems) {
      cartItems.addEventListener("click", (e) => {
        this.handleCartAction(e);
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        this.checkout();
      });
    }

    // Order type selection
    this.setupOrderTypeSelection();

    // Table selection
    this.setupTableSelection();
  }

  setupOrderTypeSelection() {
    const orderTypeBtns = document.querySelectorAll(".order-type-btn");
    orderTypeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        orderTypeBtns.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        this.orderType = btn.dataset.type;
        this.toggleShippingForm();
        this.updateTotal();
      });
    });
  }

  setupTableSelection() {
    const tableCards = document.querySelectorAll(".table-card");
    tableCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (card.classList.contains("occupied")) return;

        // Remove selection from other tables
        tableCards.forEach((c) => c.classList.remove("selected"));
        // Select current table
        card.classList.add("selected");

        this.selectedTable = card.dataset.table;
        Utils.showNotification(`Đã chọn bàn ${this.selectedTable}`, "success");
      });
    });
  }

  toggleShippingForm() {
    const shippingForm = document.getElementById("shipping-form");
    const tableSelection = document.getElementById("table-selection");

    if (this.orderType === "delivery") {
      if (shippingForm) shippingForm.style.display = "block";
      if (tableSelection) tableSelection.style.display = "none";
      this.setupShippingForm();
    } else {
      if (shippingForm) shippingForm.style.display = "none";
      if (tableSelection) tableSelection.style.display = "block";
      this.shippingFee = 0;
    }
  }

  setupShippingForm() {
    const addressInput = document.getElementById("shipping-address");
    if (addressInput) {
      addressInput.addEventListener("input", () => {
        this.calculateShippingFee(addressInput.value);
      });
    }
  }

  calculateShippingFee(address) {
    // Simple shipping fee calculation based on distance
    // In real app, this would integrate with mapping service
    if (address.length > 10) {
      this.shippingFee = 25000; // 25k VND base fee
      if (address.toLowerCase().includes("quận")) {
        this.shippingFee += 10000; // Additional fee for districts
      }
    } else {
      this.shippingFee = 0;
    }

    this.updateShippingDisplay();
    this.updateTotal();
  }

  updateShippingDisplay() {
    const shippingFeeElement = document.getElementById("shipping-fee");
    if (shippingFeeElement) {
      shippingFeeElement.textContent = Utils.formatCurrency(this.shippingFee);
    }
  }

  addToCart(itemIdOrButton, quantity = 1) {
    let itemId, itemData;

    // Support both old button-based and new ID-based approach
    if (typeof itemIdOrButton === "string") {
      // New approach: using item ID
      itemId = itemIdOrButton;
      itemData = this.menuItems.find((item) => item.id === itemId);

      if (!itemData) {
        Utils.showNotification("Món ăn không tồn tại", "error");
        return;
      }

      if (itemData.status !== "available" || itemData.inventory <= 0) {
        Utils.showNotification("Món ăn hiện không có sẵn", "warning");
        return;
      }
    } else {
      // Old approach: using button element (for backward compatibility)
      const button = itemIdOrButton;
      const menuCard = button.closest(".menu-card");
      const name = menuCard.dataset.name;
      const price = parseInt(menuCard.dataset.price, 10);

      itemData = { id: name, name: name, price: price };
      itemId = name;
    }

    if (this.cart[itemId]) {
      this.cart[itemId].quantity += quantity;
    } else {
      this.cart[itemId] = {
        id: itemData.id,
        name: itemData.name,
        price: itemData.price,
        quantity: quantity,
      };
    }

    this.saveCartToStorage();
    this.renderCart();
    Utils.showNotification(`Đã thêm ${itemData.name} vào giỏ hàng`, "success");
  }

  handleCartAction(e) {
    const button = e.target.closest("button");
    if (!button) return;

    const itemName = button.closest(".cart-item").dataset.name;

    if (button.classList.contains("increase-btn")) {
      this.cart[itemName].quantity++;
    } else if (button.classList.contains("decrease-btn")) {
      if (this.cart[itemName].quantity > 1) {
        this.cart[itemName].quantity--;
      } else {
        delete this.cart[itemName];
      }
    } else if (button.classList.contains("remove-btn")) {
      delete this.cart[itemName];
      Utils.showNotification(`Đã xóa ${itemName} khỏi giỏ hàng`, "info");
    }

    this.saveCartToStorage();
    this.renderCart();
  }

  renderCart() {
    const cartItemsList = document.getElementById("cart-items");
    const cartSummary = document.getElementById("cart-summary");

    if (!cartItemsList) return;

    cartItemsList.innerHTML = "";
    let subtotal = 0;

    if (Object.keys(this.cart).length === 0) {
      cartItemsList.innerHTML = '<li class="cart-empty">Giỏ hàng trống</li>';
      if (cartSummary) cartSummary.style.display = "none";
      return;
    }

    if (cartSummary) cartSummary.style.display = "block";

    Object.keys(this.cart).forEach((itemName) => {
      const item = this.cart[itemName];
      subtotal += item.price * item.quantity;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.dataset.name = itemName;
      li.innerHTML = `
        <div class="cart-item-details">
          <span class="name">${itemName}</span>
          <span class="price">${Utils.formatCurrency(item.price)}</span>
        </div>
        <div class="cart-item-actions">
          <button class="quantity-btn decrease-btn">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn increase-btn">+</button>
          <button class="remove-btn"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      cartItemsList.appendChild(li);
    });

    this.updateTotal(subtotal);
  }

  updateTotal(subtotal = null) {
    if (subtotal === null) {
      subtotal = Object.keys(this.cart).reduce((total, itemName) => {
        const item = this.cart[itemName];
        return total + item.price * item.quantity;
      }, 0);
    }

    const total = subtotal + this.shippingFee;
    const totalPriceEl = document.getElementById("total-price");

    if (totalPriceEl) {
      totalPriceEl.textContent = Utils.formatCurrency(total);
    }

    // Update subtotal display if exists
    const subtotalEl = document.getElementById("subtotal");
    if (subtotalEl) {
      subtotalEl.textContent = Utils.formatCurrency(subtotal);
    }
  }

  checkout() {
    if (Object.keys(this.cart).length === 0) {
      Utils.showNotification("Giỏ hàng trống!", "error");
      return;
    }

    if (this.orderType === "dine-in" && !this.selectedTable) {
      Utils.showNotification("Vui lòng chọn bàn!", "error");
      return;
    }

    if (this.orderType === "delivery") {
      const address = document.getElementById("shipping-address")?.value;
      const phone = document.getElementById("shipping-phone")?.value;

      if (!address || !phone) {
        Utils.showNotification(
          "Vui lòng điền đầy đủ thông tin giao hàng!",
          "error"
        );
        return;
      }

      this.shippingInfo = { address, phone };
    }

    const orderData = {
      id: Date.now(),
      items: this.cart,
      orderType: this.orderType,
      table: this.selectedTable,
      shippingInfo: this.shippingInfo,
      shippingFee: this.shippingFee,
      total: this.calculateTotal(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    this.saveOrder(orderData);

    // Send order to Kitchen Display System
    this.sendToKitchen(orderData);

    this.clearCart();

    const orderTypeText =
      this.orderType === "dine-in"
        ? `tại bàn ${this.selectedTable}`
        : "giao hàng";

    Utils.showNotification(
      `Đặt hàng thành công! Đơn hàng ${orderTypeText}. Mã đơn: ${orderData.id}`,
      "success"
    );
  }

  calculateTotal() {
    const subtotal = Object.keys(this.cart).reduce((total, itemName) => {
      const item = this.cart[itemName];
      return total + item.price * item.quantity;
    }, 0);
    return subtotal + this.shippingFee;
  }

  saveOrder(orderData) {
    const orders = Utils.loadFromStorage("orders", []);
    orders.push(orderData);
    Utils.saveToStorage("orders", orders);
  }

  sendToKitchen(orderData) {
    // Convert cart items to kitchen-friendly format
    const kitchenItems = Object.entries(this.cart).map(([itemId, cartItem]) => {
      // Try to get item details from menu data
      const menuItem = this.menuItems.find(
        (item) => item.id === itemId || item.name === itemId
      );

      return {
        name: cartItem.name || itemId,
        category: menuItem ? menuItem.category : "Món Chính",
        quantity: cartItem.quantity,
        notes: cartItem.notes || "",
      };
    });

    const kitchenOrder = {
      tableNumber: this.orderType === "dine-in" ? this.selectedTable : null,
      orderType:
        this.orderType === "dine-in"
          ? "Tại bàn"
          : this.orderType === "delivery"
          ? "Giao hàng"
          : "Mang về",
      items: kitchenItems,
      total: orderData.total,
      customerInfo:
        this.orderType === "delivery"
          ? {
              name: this.shippingInfo.name || "Khách hàng",
              phone: this.shippingInfo.phone || "",
              address: this.shippingInfo.address || "",
            }
          : null,
      notes: this.shippingInfo.notes || "",
    };

    // Get existing kitchen orders
    const kitchenOrders = JSON.parse(
      localStorage.getItem("kitchenOrders") || "[]"
    );

    // Create new kitchen order
    const newKitchenOrder = {
      id: `order-${Date.now()}`,
      tableNumber: kitchenOrder.tableNumber,
      orderTime: new Date().toISOString(),
      status: "pending",
      orderType: kitchenOrder.orderType,
      items: kitchenOrder.items,
      total: kitchenOrder.total,
      customerInfo: kitchenOrder.customerInfo,
      notes: kitchenOrder.notes,
      startTime: null,
      readyTime: null,
      completeTime: null,
    };

    // Add to kitchen orders
    kitchenOrders.push(newKitchenOrder);
    localStorage.setItem("kitchenOrders", JSON.stringify(kitchenOrders));

    console.log("Order sent to kitchen:", newKitchenOrder);
  }

  clearCart() {
    this.cart = {};
    this.selectedTable = null;
    this.shippingFee = 0;
    this.shippingInfo = {};
    this.saveCartToStorage();
    this.renderCart();

    // Reset form states
    const tableCards = document.querySelectorAll(".table-card");
    tableCards.forEach((card) => card.classList.remove("selected"));

    const shippingForm = document.getElementById("shipping-form");
    if (shippingForm) {
      const inputs = shippingForm.querySelectorAll("input");
      inputs.forEach((input) => (input.value = ""));
    }
  }

  saveCartToStorage() {
    Utils.saveToStorage("cart", {
      items: this.cart,
      selectedTable: this.selectedTable,
      orderType: this.orderType,
      shippingInfo: this.shippingInfo,
      shippingFee: this.shippingFee,
    });
  }

  loadCartFromStorage() {
    const savedCart = Utils.loadFromStorage("cart", {});
    if (savedCart.items) {
      this.cart = savedCart.items;
      this.selectedTable = savedCart.selectedTable;
      this.orderType = savedCart.orderType || "dine-in";
      this.shippingInfo = savedCart.shippingInfo || {};
      this.shippingFee = savedCart.shippingFee || 0;
    }
  }
}

// Initialize cart manager
const cartManager = new CartManager();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CartManager;
} else {
  window.CartManager = CartManager;
  window.cartManager = cartManager;
}
