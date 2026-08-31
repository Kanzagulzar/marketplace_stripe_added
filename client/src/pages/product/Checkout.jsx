import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import VendorPaymentForm from '../../components/VendorPaymentForm';
import { useCart } from '../../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [paidIds, setPaidIds] = useState([]);

  if (!state?.orders) {
    navigate('/cart');
    return null;
  }

  const { orders } = state;
  const allPaid = paidIds.length === orders.length;

  const handlePaid = (orderId) => {
    setPaidIds((prev) => [...prev, orderId]);
  };

  const handleDone = () => {
    clearCart();
    navigate('/orders');
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '0.5rem' }}>Payment</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: '1.5rem' }}>
        Your cart included {orders.length} seller{orders.length > 1 ? 's' : ''} — pay each one below.
      </p>

      {orders.map((order) => (
        <div key={order.orderId} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '1rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{order.vendorName}</p>
            <p style={{ fontSize: 14, margin: 0 }}>${(order.amount / 100).toFixed(2)}</p>
          </div>

          {paidIds.includes(order.orderId) ? (
            <p style={{ fontSize: 13, color: '#1e7e34' }}>Paid ✓</p>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret: order.clientSecret }}>
              <VendorPaymentForm onPaid={() => handlePaid(order.orderId)} />
            </Elements>
          )}
        </div>
      ))}

      {allPaid && (
        <button onClick={handleDone} style={{ width: '100%', padding: 12, fontSize: 14 }}>
          Done — view my orders
        </button>
      )}
    </div>
  );
}