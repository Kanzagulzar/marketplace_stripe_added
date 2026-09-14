import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/order.api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <Link className="back-link" to="/" style={{ fontSize: 13, color: '#185fa5' }}>← Back to marketplace</Link>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>My orders</h1>
      {orders.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No orders yet.</p>}
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
        {orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} style={{ display: 'block', padding: '10px 14px', borderBottom: '1px solid #eee', textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontSize: 14, margin: 0 }}>{o.items.map((i) => i.title).join(', ')}</p>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>${(o.subtotal / 100).toFixed(2)} · {o.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
