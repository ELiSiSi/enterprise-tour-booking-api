export const bookTour = async (tourId) => {
  try {
    // ✅ قراءة المفتاح من الـ body data attribute
    const stripeKey = document.body.dataset.stripeKey;

    if (!stripeKey) {
       throw new Error('Stripe public key is not configured');
    }

    const stripe = Stripe(stripeKey);

    // 1) Get checkout session
    const response = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    console.log('Session:', data);

    // 2) Redirect to checkout
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    console.error('Error:', err);
    alert(`Error: ${err.message}`);
  }
};
