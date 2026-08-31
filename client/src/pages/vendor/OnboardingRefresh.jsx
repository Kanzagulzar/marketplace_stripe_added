import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardingLink } from '../../api/vendor.api';

export default function OnboardingRefresh() {
  const navigate = useNavigate();

  useEffect(() => {
    getOnboardingLink()
      .then((res) => { window.location.href = res.data.url; })
      .catch(() => navigate('/vendor/onboarding'));
  }, []);

  return <p style={{ padding: '2rem', textAlign: 'center' }}>Redirecting you back to Stripe...</p>;
}