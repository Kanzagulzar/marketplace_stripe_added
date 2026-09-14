import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import OrderDetail from './pages/product/OrderDetail';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';
import Home from './pages/buyer/Home';
import RoleHome from './components/RoleHome';
import ProductDetail from './pages/product/ProductDetail';
import ProductForm from './pages/product/ProductForm';
import Cart from './pages/product/Cart';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOnboarding from './pages/vendor/VendorOnboarding';
import OnboardingComplete from './pages/vendor/OnboardingComplete';
import OnboardingRefresh from './pages/vendor/OnboardingRefresh';
import AdminPanel from './pages/admin/AdminPanel';
import Checkout from './pages/product/Checkout';
import Orders from './pages/product/Orders';
import VendorOrders from './pages/vendor/VendorOrders';
import AdminDisputes from './pages/admin/AdminDisputes';
import VendorStorefront from './pages/product/VendorStorefront';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute allowedRoles={['buyer']}><Home /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
<Route path="/orders/:orderId" element={<ProtectedRoute allowedRoles={['buyer']}><OrderDetail /></ProtectedRoute>} />
     <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisputes /></ProtectedRoute>} />
      <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/onboarding" element={<ProtectedRoute allowedRoles={['vendor']}><VendorOnboarding /></ProtectedRoute>} />
      <Route path="/vendor/onboarding/complete" element={<ProtectedRoute allowedRoles={['vendor']}><OnboardingComplete /></ProtectedRoute>} />
      <Route path="/vendor/onboarding/refresh" element={<ProtectedRoute allowedRoles={['vendor']}><OnboardingRefresh /></ProtectedRoute>} />
      <Route path="/vendor/products/new" element={<ProtectedRoute allowedRoles={['vendor']}><ProductForm /></ProtectedRoute>} />
     
<Route path="/store/:slug" element={<ProtectedRoute><VendorStorefront /></ProtectedRoute>} />

      <Route path="/vendor/products/:id/edit" element={<ProtectedRoute allowedRoles={['vendor']}><ProductForm /></ProtectedRoute>} />
<Route path="/checkout" element={<ProtectedRoute allowedRoles={['buyer']}><Checkout /></ProtectedRoute>} />
<Route path="/orders" element={<ProtectedRoute allowedRoles={['buyer']}><Orders /></ProtectedRoute>} />
<Route path="/vendor/orders" element={<ProtectedRoute allowedRoles={['vendor']}><VendorOrders /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
    </Routes>
    
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
