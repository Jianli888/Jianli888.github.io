const WHATSAPP_NUMBER = '0782471688';

const dialog = document.querySelector('#order-dialog');
const orderItems = [...document.querySelectorAll('.order-item')];
const total = document.querySelector('#total');
const whatsapp = document.querySelector('#whatsapp-link');
const isGerman = document.documentElement.lang === 'de';
const copy = isGerman ? {
  empty: 'Mindestens ein Glas wählen',
  continue: 'Weiter auf WhatsApp <span>↗</span>',
  intro: 'Hallo Jian! Ich möchte gerne bestellen:',
  total: 'Total',
  details: 'Mein Name und meine Lieferadresse sind: '
} : {
  empty: 'Choose at least one jar',
  continue: 'Continue on WhatsApp <span>↗</span>',
  intro: 'Hello Jian! I would like to order:',
  total: 'Total',
  details: 'My name and delivery address are: '
};

function updateOrder() {
  const selections = orderItems.map(item => {
    const input = item.querySelector('input');
    const quantity = Math.max(0, Math.min(20, Number(input.value) || 0));
    input.value = quantity;
    return { name: item.dataset.product, price: Number(item.dataset.price), quantity };
  }).filter(item => item.quantity > 0);
  const amount = selections.reduce((sum, item) => sum + item.price * item.quantity, 0);
  total.textContent = `CHF ${amount.toFixed(2)}`;

  if (!selections.length) {
    whatsapp.href = '#';
    whatsapp.classList.add('is-disabled');
    whatsapp.setAttribute('aria-disabled', 'true');
    whatsapp.textContent = copy.empty;
    return;
  }

  const lines = selections.map(item => `${item.quantity} × ${item.name} — CHF ${(item.price * item.quantity).toFixed(2)}`);
  const beforeDelivery = isGerman ? 'vor Lieferung' : 'before delivery';
  const message = `${copy.intro}\n${lines.join('\n')}\n\n${copy.total}: CHF ${amount.toFixed(2)} ${beforeDelivery}.\n${copy.details}`;
  whatsapp.href = `https://wa.me/41${WHATSAPP_NUMBER.slice(1)}?text=${encodeURIComponent(message)}`;
  whatsapp.classList.remove('is-disabled');
  whatsapp.removeAttribute('aria-disabled');
  whatsapp.innerHTML = copy.continue;
}

function openOrder(selectedProduct) {
  if (selectedProduct) {
    const match = orderItems.find(item => item.dataset.product === selectedProduct);
    if (match) match.querySelector('input').value = 1;
  }
  updateOrder();
  dialog.showModal();
}

document.querySelectorAll('.js-open-order').forEach(button => button.addEventListener('click', () => openOrder()));
document.querySelectorAll('.js-buy').forEach(button => button.addEventListener('click', () => openOrder(button.dataset.product)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
orderItems.forEach(item => {
  const input = item.querySelector('input');
  input.addEventListener('input', updateOrder);
  item.querySelector('[data-action="minus"]').addEventListener('click', () => { input.value = Math.max(0, Number(input.value) - 1); updateOrder(); });
  item.querySelector('[data-action="plus"]').addEventListener('click', () => { input.value = Math.min(20, Number(input.value) + 1); updateOrder(); });
});
updateOrder();
