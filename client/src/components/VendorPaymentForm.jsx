import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function VendorPaymentForm({ onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    // requires_capture means the card is authorized and funds are held — correct for escrow
    if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
      try {
        await onPaid();
      } catch (err) {
        setError(err.response?.data?.error || 'Payment was authorized, but we could not update the order');
        setProcessing(false);
      }
    } else {
      setError('Payment did not complete');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 8 }}>{error}</p>}
      <button type="submit" disabled={!stripe || processing} style={{ padding: '8px 16px', fontSize: 13, marginTop: 10 }}>
        {processing ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}
