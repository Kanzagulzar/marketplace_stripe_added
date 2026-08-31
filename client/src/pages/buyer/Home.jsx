import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../api/product.api';

export default function Home() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Welcome, {user.name}</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Role: {user.role}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/cart" style={{ fontSize: 14, color: '#185fa5' }}>
            Cart {items.length > 0 && `(${items.reduce((sum, i) => sum + i.qty, 0)})`}
          </Link>
          <button onClick={logout} style={{ padding: '8px 16px', fontSize: 14 }}>Log out</button>
        </div>
      </div>

      {user.role === 'vendor' && (
        <Link to="/vendor/dashboard" style={{ fontSize: 14, color: '#185fa5' }}>Go to vendor dashboard</Link>
      )}

      {user.role === 'admin' && (
  <Link to="/admin" style={{ fontSize: 14, color: '#185fa5' }}>Go to admin panel</Link>
)}

      <h2 style={{ fontSize: 16, fontWeight: 500, marginTop: '2rem', marginBottom: 12 }}>Products</h2>

      {loading && <p style={{ fontSize: 14, color: '#666' }}>Loading products...</p>}
      {!loading && products.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No products yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 12, textDecoration: 'none', color: 'inherit' }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{p.title}</p>
            <p style={{ fontSize: 13, color: '#666', margin: 0 }}>${(p.price / 100).toFixed(2)}</p>
            <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>Sold by {p.vendorId?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}