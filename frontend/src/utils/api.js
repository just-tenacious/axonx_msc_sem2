import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// For now, these are simple wrappers
export const getUserProfile = (id) => api.get(`/users/${id}/profile`);
export const loginUser = (data) => api.post('/users/login', data);
export const registerUser = (data) => api.post('/users/register', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getAllUsers = () => api.get('/users');

export default api;
