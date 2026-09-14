import api from './axios';

export const createReview = (data) => api.post('/reviews', data);
export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const getReviewedProductIds = (orderId) => api.get(`/reviews/order/${orderId}/mine`);