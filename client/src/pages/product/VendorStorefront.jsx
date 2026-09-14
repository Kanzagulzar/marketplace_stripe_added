import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVendorBySlug } from '../../api/vendor.api';
import { getProducts } from '../../api/product.api';

export default function VendorStorefront() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVendorBySlug(slug)
      .then((res) => {
        setVendor(res.data);
        return getProducts({ vendor: res.data._id });
      })
      .then((res) => setProducts(res.data))
      .catch(() => setError('Store not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

  return (
    <div className="storefront-page" style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <header className="storefront-nav">
        <Link className="back-link" to="/products" style={{ fontSize: 13, color: '#185fa5' }}>← Back to products</Link>
        <span>Seller storefront</span>
      </header>
      <Link className="back-link" to="/" style={{ fontSize: 13, color: '#185fa5' }}>← Back to marketplace</Link>

      <section className="storefront-hero" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div className="storefront-hero-copy">
          <span className="eyebrow">Independent seller</span>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: '0 0 4px' }}>{vendor.storeName}</h1>
        <p className="storefront-intro">A considered collection, chosen and offered by a trusted marketplace seller.</p>
        {vendor.rating > 0 && (
          <p style={{ fontSize: 14, color: '#f5a623', margin: 0 }}>
            ★ {vendor.rating.toFixed(1)} <span style={{ color: '#999' }}>average rating</span>
          </p>
        )}
        <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>/{vendor.storeSlug}</p>
        </div>
        <div className="storefront-orb" aria-hidden="true"><span>{vendor.storeName.slice(0, 1).toUpperCase()}</span><i /><b /></div>
      </section>

      <div className="storefront-catalogue-heading">
        <div><span className="eyebrow">Available now</span><h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Shop the collection</h2></div>
        <span className="storefront-count">{products.length.toString().padStart(2, '0')} products</span>
      </div>

      {products.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No products listed yet.</p>}

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            className="product-card"
            style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
          >
            {p.images?.[0] && (
              <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
            )}
            <div style={{ padding: 12 }}>
              <span className="product-card-label">View product</span>
              <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{p.title}</p>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>${(p.price / 100).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
