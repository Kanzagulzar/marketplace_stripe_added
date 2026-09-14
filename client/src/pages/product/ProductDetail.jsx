// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { getProductById } from '../../api/product.api';
// import { useCart } from '../../context/CartContext';

// export default function ProductDetail() {
//   const { id } = useParams();
//   const { addItem } = useCart();
//   const [product, setProduct] = useState(null);
//   const [qty, setQty] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [added, setAdded] = useState(false);

//   useEffect(() => {
//     getProductById(id)
//       .then((res) => setProduct(res.data))
//       .catch(() => setError('Product not found'))
//       .finally(() => setLoading(false));
//   }, [id]);

//   const handleAddToCart = () => {
//     addItem(product, qty);
//     setAdded(true);
//     setTimeout(() => setAdded(false), 1500);
//   };

//   if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
//   if (error) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

//   return (
//     <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
//       <Link to="/" style={{ fontSize: 13, color: '#185fa5' }}>← Back</Link>
      
//       {product.images?.length > 0 && (
//   <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto' }}>
//     {product.images.map((url) => (
//       <img key={url} src={url} alt={product.title} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
//     ))}
//   </div>
// )}
      
//       <h1 style={{ fontSize: 20, fontWeight: 500, margin: '1rem 0 4px' }}>{product.title}</h1>
//       <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>${(product.price / 100).toFixed(2)}</p>
//       <p style={{ fontSize: 13, color: '#666', margin: '0 0 1rem' }}>Sold by {product.vendorId?.name}</p>
//       <p style={{ fontSize: 14, lineHeight: 1.5 }}>{product.description}</p>
//       <p style={{ fontSize: 13, color: '#999', margin: '12px 0' }}>{product.stock} in stock</p>

//       <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1rem' }}>
//         <input
//           type="number"
//           min="1"
//           max={product.stock}
//           value={qty}
//           onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
//           style={{ width: 60, padding: 8, fontSize: 14 }}
//         />
//         <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ padding: '10px 16px', fontSize: 14 }}>
//           {added ? 'Added ✓' : 'Add to cart'}
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api/product.api';
import { getProductReviews } from '../../api/review.api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));

    getProductReviews(id).then((res) => setReviews(res.data)).catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

  return (
    <div className="product-detail-page" style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <Link className="back-link" to="/" style={{ fontSize: 13, color: '#185fa5' }}>← Back</Link>

      {product.images?.length > 0 && (
        <div className="product-gallery" style={{ display: 'flex', gap: 8, margin: '1rem 0 12px', overflowX: 'auto' }}>
          {product.images.map((url) => (
            <img key={url} src={url} alt={product.title} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
          ))}
        </div>
      )}

      <h1 style={{ fontSize: 20, fontWeight: 500, margin: '1rem 0 4px' }}>{product.title}</h1>
      <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>${(product.price / 100).toFixed(2)}</p>
      {/* <p style={{ fontSize: 13, color: '#666', margin: '0 0 1rem' }}>
        Sold by {product.vendorId?.storeName || product.vendorId?.name}
        {product.vendorId?.rating > 0 && (
          <span style={{ color: '#f5a623', marginLeft: 6 }}>★ {product.vendorId.rating.toFixed(1)}</span>
        )}
      </p> */}

      <p style={{ fontSize: 13, color: '#666', margin: '0 0 1rem' }}>
  Sold by{' '}
  <Link to={`/store/${product.vendorId?.storeSlug}`} style={{ color: '#185fa5' }}>
    {product.vendorId?.storeName || product.vendorId?.name}
  </Link>
  {product.vendorId?.rating > 0 && (
    <span style={{ color: '#f5a623', marginLeft: 6 }}>★ {product.vendorId.rating.toFixed(1)}</span>
  )}
</p>
      <p style={{ fontSize: 14, lineHeight: 1.5 }}>{product.description}</p>
      <p style={{ fontSize: 13, color: '#999', margin: '12px 0' }}>{product.stock} in stock</p>

      <div className="purchase-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1rem' }}>
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

      <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </p>
        {reviews.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} style={{ borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.buyerId?.name || 'Anonymous'}</span>
              <span style={{ color: '#f5a623', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{r.comment}</p>}
            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
