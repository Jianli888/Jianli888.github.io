const MERCHANT_ID = 5854448641;
const card = document.querySelector('#confirmation-card');
const errorCard = document.querySelector('#confirmation-error');

function loadGoogleSurvey(order) {
  window.renderOptIn = function () {
    window.gapi.load('surveyoptin', function () {
      window.gapi.surveyoptin.render({
        merchant_id: MERCHANT_ID,
        order_id: order.orderId,
        email: order.email,
        delivery_country: order.country,
        estimated_delivery_date: order.estimatedDeliveryDate,
        opt_in_style: 'CENTER_DIALOG'
      });
    });
  };
  window.___gcfg = { lang: order.language === 'de' ? 'de' : 'en' };
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

try {
  const order = JSON.parse(sessionStorage.getItem('jiansChiliConfirmedOrder'));
  const isRecent = order && Date.now() - new Date(order.createdAt).getTime() < 24 * 60 * 60 * 1000;
  if (!order?.orderId || !order?.email || !order?.estimatedDeliveryDate || order.country !== 'CH' || !isRecent) throw new Error('Invalid order');

  if (order.language === 'de') {
    document.documentElement.lang = 'de';
    document.title = 'Bestellung bestätigt — Jian’s Chili';
    document.querySelector('#confirmation-eyebrow').textContent = 'Bestellung bestätigt';
    document.querySelector('#confirmation-title').textContent = 'Vielen Dank!';
    document.querySelector('#confirmation-message').textContent = 'Deine Bestellung wurde mit Jian auf WhatsApp bestätigt.';
    document.querySelector('#reference-label').textContent = 'Bestellnummer';
    document.querySelector('#date-label').textContent = 'Voraussichtliches Datum';
    document.querySelector('#survey-note').textContent = 'Google fragt dich möglicherweise, ob du nach deiner Bestellung an einer kurzen Kundenumfrage teilnehmen möchtest.';
  }

  document.querySelector('#order-reference').textContent = order.orderId;
  document.querySelector('#order-date').textContent = new Intl.DateTimeFormat(order.language === 'de' ? 'de-CH' : 'en-CH', {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(`${order.estimatedDeliveryDate}T00:00:00Z`));
  card.hidden = false;
  loadGoogleSurvey(order);
} catch (error) {
  errorCard.hidden = false;
}
