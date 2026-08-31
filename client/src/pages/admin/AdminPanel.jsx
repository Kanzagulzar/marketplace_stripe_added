import { useEffect, useState } from 'react';
import { listVendors, updateVendorStatus } from '../../api/vendor.api';

export default function AdminPanel() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVendors = () => {
    setLoading(true);
    listVendors()
      .then((res) => setVendors(res.data))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleStatusChange = async (vendorId, status) => {
    await updateVendorStatus(vendorId, status);
    loadVendors();
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  const pending = vendors.filter((v) => v.status === 'pending');
  const others = vendors.filter((v) => v.status !== 'pending');

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1.5rem' }}>Vendor requests</h1>

      {pending.length === 0 && others.length === 0 && (
        <p style={{ fontSize: 14, color: '#666' }}>No vendor accounts yet.</p>
      )}

      {pending.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: '#999', marginBottom: 8 }}>Pending approval</h2>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem' }}>
            {pending.map((v) => (
              <div
                key={v._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}
              >
                <div>
                  <p style={{ fontSize: 14, margin: 0 }}>{v.storeName}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    {v.userId?.name} · {v.userId?.email} · /{v.storeSlug}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleStatusChange(v._id, 'approved')} style={{ fontSize: 13, padding: '6px 12px' }}>
                    Approve
                  </button>
                  <button onClick={() => handleStatusChange(v._id, 'suspended')} style={{ fontSize: 13, padding: '6px 12px', color: '#c0392b' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: '#999', marginBottom: 8 }}>All vendors</h2>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
            {others.map((v) => (
              <div
                key={v._id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}
              >
                <div>
                  <p style={{ fontSize: 14, margin: 0 }}>{v.storeName}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    {v.userId?.name} · {v.userId?.email} · /{v.storeSlug}
                  </p>
                </div>
                <span style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: v.status === 'approved' ? '#e6f4ea' : '#fdecea',
                  color: v.status === 'approved' ? '#1e7e34' : '#c0392b'
                }}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}