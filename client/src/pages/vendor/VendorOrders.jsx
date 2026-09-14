import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorOrders, markShipped } from '../../api/order.api';

const STATUS_COLORS = {
  paid: { bg: '#eaf1fb', color: '#185fa5' },
  processing: { bg: '#fff8e1', color: '#8a6d00' },
  shipped: { bg: '#e6f4ea', color: '#1e7e34' },
  delivered: { bg: '#e6f4ea', color: '#1e7e34' },
  disputed: { bg: '#fdecea', color: '#c0392b' },
  refunded: { bg: '#f0f0f0', color: '#666' }
};

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingId, setShippingId] = useState(null);
  const [error, setError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    getVendorOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkShipped = async (orderId) => {
    setError('');
    setShippingId(orderId);
    try {
      await markShipped(orderId);
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark shipped');
    } finally {
      setShippingId(null);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Orders</h1>
        <Link className="back-link" to="/vendor/dashboard" style={{ fontSize: 13, color: '#185fa5' }}>← Back to dashboard</Link>
      </div>

      {error && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 12 }}>{error}</p>}

      {orders.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No orders yet.</p>}

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
        {orders.map((o) => {
          const colors = STATUS_COLORS[o.status] || { bg: '#f0f0f0', color: '#666' };
          return (
            <div key={o._id} style={{ padding: '12px 14px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 14, margin: 0 }}>{o.items.map((i) => `${i.title} x${i.qty}`).join(', ')}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>
                    Order #{o._id.slice(-6).toUpperCase()} · ${(o.subtotal / 100).toFixed(2)}
                  </p>
                </div>
                <span style={{ fontSize: 12, background: colors.bg, color: colors.color, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                  {o.status}
                </span>
              </div>

              {o.status === 'paid' && (
                <button
                  onClick={() => handleMarkShipped(o._id)}
                  disabled={shippingId === o._id}
                  style={{ fontSize: 13, padding: '6px 12px', marginTop: 6 }}
                >
                  {shippingId === o._id ? 'Marking shipped...' : 'Mark shipped'}
                </button>
              )}

              {o.status === 'shipped' && (
                <p style={{ fontSize: 12, color: '#999', margin: '6px 0 0' }}>
                  Payment captured · escrow releases {new Date(o.escrowReleaseDate).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
