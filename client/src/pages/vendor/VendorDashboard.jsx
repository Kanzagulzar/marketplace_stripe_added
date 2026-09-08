import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProducts, deleteProduct } from '../../api/product.api';
import { getMyVendorProfile, getOnboardingLink } from '../../api/vendor.api';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const vendorRes = await getMyVendorProfile();
      setVendor(vendorRes.data);
      const productsRes = await getMyProducts();
      setProducts(productsRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/vendor/onboarding');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    loadAll();
  };

  const handleFinishStripeSetup = async () => {
  const res = await getOnboardingLink();
  window.location.href = res.data.url;
};

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
  <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{vendor.storeName}</h1>
  {vendor.status === 'approved' && (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Link to="/vendor/orders" style={{ fontSize: 14, color: '#185fa5' }}>
        Orders
      </Link>
      <Link to="/vendor/products/new" style={{ fontSize: 14, padding: '8px 14px', border: '1px solid #ccc', borderRadius: 6 }}>
        + New product
      </Link>
    </div>
  )}
</div>
      <p style={{ fontSize: 13, color: '#999', marginBottom: '1.5rem' }}>/{vendor.storeSlug}</p>

      {vendor.status === 'pending' && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe0a3', borderRadius: 8, padding: '10px 14px', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, margin: 0 }}>Your store is pending admin approval. You can't list products yet.</p>
        </div>
      )}

      {vendor.status === 'suspended' && (
        <div style={{ background: '#fdecea', border: '1px solid #f5b7b1', borderRadius: 8, padding: '10px 14px', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, margin: 0 }}>Your store has been suspended.</p>
        </div>
      )}

{vendor.status === 'approved' && !vendor.payoutsEnabled && (
  <div style={{ background: '#fff8e1', border: '1px solid #ffe0a3', borderRadius: 8, padding: '10px 14px', marginBottom: '1.5rem' }}>
    <p style={{ fontSize: 13, margin: '0 0 8px' }}>You need to finish Stripe setup before you can ship orders.</p>
    <button onClick={handleFinishStripeSetup} style={{ fontSize: 13, padding: '6px 12px' }}>
      Finish payment setup
    </button>
  </div>
)}

      {vendor.status === 'approved' && (
        <>
          {products.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>You haven't listed any products yet.</p>}
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
            {products.map((p) => (
              <div
                key={p._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}
              >
                <div>
                  <p style={{ fontSize: 14, margin: 0 }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    ${(p.price / 100).toFixed(2)} · {p.stock} in stock · {p.status}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/vendor/products/${p._id}/edit`} style={{ fontSize: 13, color: '#185fa5' }}>Edit</Link>
                  <button onClick={() => handleDelete(p._id)} style={{ fontSize: 13, color: '#c0392b' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}