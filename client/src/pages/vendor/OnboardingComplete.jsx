import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkOnboardingStatus } from '../../api/vendor.api';

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    checkOnboardingStatus()
      .then((res) => {
        setStatus(res.data.payoutsEnabled ? 'success' : 'incomplete');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{ maxWidth: 380, margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
      {status === 'checking' && <p style={{ fontSize: 14, color: '#666' }}>Checking your account status...</p>}

      {status === 'success' && (
        <>
          <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>You're all set</h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: '1.5rem' }}>
            Your bank details are verified. Your store still needs admin approval before you can list products.
          </p>
          <button onClick={() => navigate('/vendor/dashboard')} style={{ padding: '10px 18px', fontSize: 14 }}>
            Go to dashboard
          </button>
        </>
      )}

      {status === 'incomplete' && (
        <>
          <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Almost there</h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: '1.5rem' }}>
            Stripe still needs a bit more information before payouts can be enabled.
          </p>
          <button onClick={() => navigate('/vendor/onboarding')} style={{ padding: '10px 18px', fontSize: 14 }}>
            Finish setup
          </button>
        </>
      )}

      {status === 'error' && <p style={{ fontSize: 14, color: '#c0392b' }}>Something went wrong. Please try again.</p>}
    </div>
  );
}