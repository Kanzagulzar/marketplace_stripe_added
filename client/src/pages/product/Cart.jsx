import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { groupedByVendor, total, removeItem, updateQty } = useCart();

  if (groupedByVendor.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>Your cart is empty.</p>
        <Link to="/" style={{ fontSize: 14, color: '#185fa5' }}>Browse products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>Your cart</h1>

      {groupedByVendor.map((group) => (
        <div
          key={group.vendorId}
          style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 12 }}
        >
          <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Sold by {group.vendorName}</p>
          {group.items.map((item) => (
            <div
              key={item.productId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderTop: '1px solid #eee'
              }}
            >
              <div>
                <p style={{ fontSize: 14, margin: 0 }}>{item.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.productId, Math.max(1, Number(e.target.value)))}
                    style={{ width: 48, fontSize: 12 }}
                  />
                  <button onClick={() => removeItem(item.productId)} style={{ fontSize: 12, color: '#c0392b' }}>
                    Remove
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                ${((item.price * item.qty) / 100).toFixed(2)}
              </p>
            </div>
          ))}
          <p style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' }}>
            Subtotal: ${(group.subtotal / 100).toFixed(2)}
          </p>
        </div>
      ))}

      <div
        style={{
          borderTop: '1px solid #ccc',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <p style={{ fontSize: 14, color: '#666' }}>
          Total ({groupedByVendor.length} order{groupedByVendor.length > 1 ? 's' : ''}, 1 payment)
        </p>
        <p style={{ fontSize: 20, fontWeight: 500 }}>${(total / 100).toFixed(2)}</p>
      </div>

      <button disabled style={{ width: '100%', padding: 12, fontSize: 14 }}>
        Checkout (coming next)
      </button>
    </div>
  );
}