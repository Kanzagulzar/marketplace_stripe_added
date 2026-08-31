import api from './axios';

export const checkout = (data) => api.post('/orders/checkout', data);
export const getMyOrders = () => api.get('/orders/mine');
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const getVendorOrders = () => api.get('/orders/vendor/mine');
export const markShipped = (orderId) => api.patch(`/orders/${orderId}/ship`);
export const confirmDelivery = (orderId) => api.patch(`/orders/${orderId}/confirm-delivery`);
export const raiseDispute = (orderId, reason) => api.patch(`/orders/${orderId}/dispute`, { reason });