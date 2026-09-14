import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BuyerLanding from '../pages/buyer/BuyerLanding';

export default function RoleHome() {
  const { user } = useAuth();

  if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <BuyerLanding />;
}
