const WHATSAPP_NUMBER = '0782471688';

const dialog = document.querySelector('#order-dialog');
const product = document.querySelector('#product');
const quantity = document.querySelector('#quantity');
const total = document.querySelector('#total');
const whatsapp = document.querySelector('#whatsapp-link');

function updateOrder() {
  const option = product.options[product.selectedIndex];
  const qty = Math.max(1, Math.min(20, Number(quantity.value) || 1));
  quantity.value = qty;
  const amount = (Number(option.dataset.price) * qty).toFixed(2);
  total.textContent = `CHF ${amount}`;
  const message = `Hello Jian! I would like to order ${qty} × ${option.value} (CHF ${amount}, before delivery). My name and delivery address are: `;
  whatsapp.href = `https://wa.me/41${WHATSAPP_NUMBER.slice(1)}?text=${encodeURIComponent(message)}`;
}

function openOrder(selectedProduct) {
  if (selectedProduct) {
    const match = [...product.options].find(option => option.value === selectedProduct);
    if (match) match.selected = true;
  }
  updateOrder();
  dialog.showModal();
}

document.querySelectorAll('.js-open-order').forEach(button => button.addEventListener('click', () => openOrder()));
document.querySelectorAll('.js-buy').forEach(button => button.addEventListener('click', () => openOrder(button.dataset.product)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
product.addEventListener('change', updateOrder);
quantity.addEventListener('input', updateOrder);
document.querySelector('#qty-minus').addEventListener('click', () => { quantity.value = Math.max(1, Number(quantity.value) - 1); updateOrder(); });
document.querySelector('#qty-plus').addEventListener('click', () => { quantity.value = Math.min(20, Number(quantity.value) + 1); updateOrder(); });
document.querySelector('#year').textContent = new Date().getFullYear();
updateOrder();
