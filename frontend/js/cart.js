// Cart management module using localStorage
const cart = {
  getItems() {
    const items = localStorage.getItem('cart');
    return items ? JSON.parse(items) : [];
  },

  saveItems(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.updateCartCount();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    this.saveItems(items);
    showToast(`${product.name} added to cart!`, 'success');
  },

  removeItem(productId) {
    const items = this.getItems().filter(item => item.id !== productId);
    this.saveItems(items);
  },

  updateQuantity(productId, quantity) {
    const items = this.getItems();
    const item = items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveItems(items);
    }
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  clear() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  },

  updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    countElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
};

// Toast notification
let _toastTimeout = null;
function showToast(message, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  clearTimeout(_toastTimeout);
  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Trigger reflow
  void toast.offsetWidth;
  toast.classList.add('show');

  _toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCartCount();
});
