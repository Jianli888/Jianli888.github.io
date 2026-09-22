const WHATSAPP_NUMBER = '0782471688';

const dialog = document.querySelector('#order-dialog');
const orderItems = [...document.querySelectorAll('.order-item')];
const total = document.querySelector('#total');
const totalLabel = document.querySelector('#order-total-label');
const whatsapp = document.querySelector('#whatsapp-link');
const emailInput = document.querySelector('#customer-email');
const fulfilmentInput = document.querySelector('#fulfilment-method');
const estimatedDateInput = document.querySelector('#estimated-date');
const confirmStep = document.querySelector('#order-confirm-step');
const isGerman = document.documentElement.lang === 'de';
const copy = isGerman ? {
  empty: 'Mindestens ein Glas wählen',
  incomplete: 'E-Mail und Datum ergänzen',
  continue: 'Weiter auf WhatsApp <span>↗</span>',
  intro: 'Hallo Jian! Ich möchte gerne bestellen:',
  total: 'Total',
  reference: 'Bestellnummer',
  email: 'E-Mail',
  method: 'Übergabe',
  deliveryDate: 'Voraussichtliches Lieferdatum',
  pickupDate: 'Voraussichtliches Abholdatum',
  delivery: 'Lieferung in der Schweiz',
  pickup: 'Abholung in Winterthur',
  deliverySummary: 'Produktetotal: CHF {amount}. Lieferung ab CHF 8.50; der definitive Gesamtbetrag wird auf WhatsApp bestätigt.',
  pickupSummary: 'Gesamtbetrag: CHF {amount}. Abholung in Winterthur ist kostenlos.',
  deliveryTotalLabel: 'Produktetotal · Lieferung ab CHF 8.50',
  pickupTotalLabel: 'Total · kostenlose Abholung',
  deliveryDetails: 'Mein Name und meine Lieferadresse sind: ',
  pickupDetails: 'Mein Name ist: '
} : {
  empty: 'Choose at least one jar',
  incomplete: 'Add email and date',
  continue: 'Continue on WhatsApp <span>↗</span>',
  intro: 'Hello Jian! I would like to order:',
  total: 'Total',
  reference: 'Order reference',
  email: 'Email',
  method: 'Fulfilment',
  deliveryDate: 'Expected delivery date',
  pickupDate: 'Expected pickup date',
  delivery: 'Delivery in Switzerland',
  pickup: 'Pickup in Winterthur',
  deliverySummary: 'Product total: CHF {amount}. Delivery starts at CHF 8.50; the final total will be confirmed on WhatsApp.',
  pickupSummary: 'Total: CHF {amount}. Pickup in Winterthur is free.',
  deliveryTotalLabel: 'Product total · delivery from CHF 8.50',
  pickupTotalLabel: 'Total · free pickup',
  deliveryDetails: 'My name and delivery address are: ',
  pickupDetails: 'My name is: '
};

function createOrderId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return `JC-${date}-${bytes[0].toString(36).toUpperCase().slice(0, 6).padStart(6, '0')}`;
}

function setDefaultDate() {
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + 2);
  const value = earliest.toISOString().slice(0, 10);
  estimatedDateInput.min = value;
  if (!estimatedDateInput.value) estimatedDateInput.value = value;
}

function updateOrder() {
  const selections = orderItems.map(item => {
    const input = item.querySelector('input');
    const quantity = Math.max(0, Math.min(20, Number(input.value) || 0));
    input.value = quantity;
    return { name: item.dataset.product, price: Number(item.dataset.price), quantity };
  }).filter(item => item.quantity > 0);
  const amount = selections.reduce((sum, item) => sum + item.price * item.quantity, 0);
  total.textContent = `CHF ${amount.toFixed(2)}`;
  totalLabel.textContent = fulfilmentInput.value === 'pickup' ? copy.pickupTotalLabel : copy.deliveryTotalLabel;

  const emailValid = emailInput.validity.valid && emailInput.value.trim();
  const dateValid = estimatedDateInput.validity.valid && estimatedDateInput.value;

  if (!selections.length || !emailValid || !dateValid) {
    whatsapp.href = '#';
    whatsapp.classList.add('is-disabled');
    whatsapp.setAttribute('aria-disabled', 'true');
    whatsapp.textContent = selections.length ? copy.incomplete : copy.empty;
    return;
  }

  const lines = selections.map(item => `${item.quantity} × ${item.name} — CHF ${(item.price * item.quantity).toFixed(2)}`);
  const method = fulfilmentInput.value === 'pickup' ? copy.pickup : copy.delivery;
  const dateLabel = fulfilmentInput.value === 'pickup' ? copy.pickupDate : copy.deliveryDate;
  const detailsPrompt = fulfilmentInput.value === 'pickup' ? copy.pickupDetails : copy.deliveryDetails;
  const orderId = whatsapp.dataset.orderId || createOrderId();
  whatsapp.dataset.orderId = orderId;
  const priceSummary = (fulfilmentInput.value === 'pickup' ? copy.pickupSummary : copy.deliverySummary).replace('{amount}', amount.toFixed(2));
  const message = `${copy.intro}\n${lines.join('\n')}\n\n${priceSummary}\n${copy.reference}: ${orderId}\n${copy.email}: ${emailInput.value.trim()}\n${copy.method}: ${method}\n${dateLabel}: ${estimatedDateInput.value}\n\n${detailsPrompt}`;
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
[emailInput, fulfilmentInput, estimatedDateInput].forEach(input => input.addEventListener('input', updateOrder));
whatsapp.addEventListener('click', event => {
  if (whatsapp.classList.contains('is-disabled')) {
    event.preventDefault();
    return;
  }
  const order = {
    orderId: whatsapp.dataset.orderId,
    email: emailInput.value.trim(),
    country: 'CH',
    estimatedDeliveryDate: estimatedDateInput.value,
    fulfilment: fulfilmentInput.value,
    language: isGerman ? 'de' : 'en',
    createdAt: new Date().toISOString()
  };
  sessionStorage.setItem('jiansChiliConfirmedOrder', JSON.stringify(order));
  confirmStep.hidden = false;
});
setDefaultDate();
updateOrder();
