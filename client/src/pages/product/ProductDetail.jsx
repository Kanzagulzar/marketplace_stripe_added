import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api/product.api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/" style={{ fontSize: 13, color: '#185fa5' }}>← Back</Link>
      <h1 style={{ fontSize: 20, fontWeight: 500, margin: '1rem 0 4px' }}>{product.title}</h1>
      <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>${(product.price / 100).toFixed(2)}</p>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 1rem' }}>Sold by {product.vendorId?.name}</p>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>{product.description}</p>
      <p style={{ fontSize: 13, color: '#999', margin: '12px 0' }}>{product.stock} in stock</p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1rem' }}>
        <input
          type="number"
          min="1"
          max={product.stock}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          style={{ width: 60, padding: 8, fontSize: 14 }}
        />
        <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ padding: '10px 16px', fontSize: 14 }}>
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}