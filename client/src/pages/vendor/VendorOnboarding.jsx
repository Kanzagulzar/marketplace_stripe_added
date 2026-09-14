import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createVendorProfile, getOnboardingLink } from '../../api/vendor.api';

export default function VendorOnboarding() {
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createVendorProfile({ storeName });
      const linkRes = await getOnboardingLink();
      window.location.href = linkRes.data.url; // redirect to Stripe's hosted onboarding
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create store');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '3rem auto', padding: '0 1rem' }}>
      <Link className="back-link" to="/vendor/dashboard" style={{ fontSize: 13, color: '#185fa5' }}>← Back to dashboard</Link>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>Set up your store</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          placeholder="Store name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          style={{ padding: 10, fontSize: 14 }}
        />
        {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: 12, fontSize: 14 }}>
          {loading ? 'Redirecting to Stripe...' : 'Continue to payment setup'}
        </button>
      </form>
      <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
        You'll be redirected to Stripe to verify your bank details, then brought back here.
      </p>
    </div>
  );
}
