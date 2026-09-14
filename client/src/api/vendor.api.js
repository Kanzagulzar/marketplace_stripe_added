import api from './axios';

export const createVendorProfile = (data) => api.post('/vendors', data);
export const getMyVendorProfile = () => api.get('/vendors/me');
export const getOnboardingLink = () => api.get('/vendors/onboarding-link');
export const checkOnboardingStatus = () => api.get('/vendors/onboarding-status');

export const listVendors = () => api.get('/vendors');
export const updateVendorStatus = (vendorId, status) => api.patch(`/vendors/${vendorId}/status`, { status });

export const getVendorBySlug = (slug) => api.get(`/vendors/store/${slug}`);