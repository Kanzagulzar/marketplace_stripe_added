import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getMyProducts = () => api.get('/products/vendor/mine');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};