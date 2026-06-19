import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API Services
export const filesAPI = {
  upload: (formData: FormData) => 
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: any) => api.get('/files', { params }),
  getById: (id: number) => api.get(`/files/${id}`),
  update: (id: number, data: any) => api.put(`/files/${id}`, data),
  delete: (id: number) => api.delete(`/files/${id}`),
  download: (id: number) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  getFolders: (parentId?: number) => api.get('/files/folders/list', { params: { parent_id: parentId } }),
  createFolder: (data: any) => api.post('/files/folders', data),
};

export const photosAPI = {
  upload: (formData: FormData) =>
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: any) => api.get('/photos', { params }),
  getById: (id: number) => api.get(`/photos/${id}`),
  update: (id: number, data: any) => api.put(`/photos/${id}`, data),
  delete: (id: number) => api.delete(`/photos/${id}`),
  toggleFavorite: (id: number) => api.post(`/photos/${id}/favorite`),
};

export const projectsAPI = {
  create: (data: any) => api.post('/projects', data),
  getAll: (params?: any) => api.get('/projects', { params }),
  getById: (id: number) => api.get(`/projects/${id}`),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

export const notesAPI = {
  create: (data: any) => api.post('/notes', data),
  getAll: (params?: any) => api.get('/notes', { params }),
  getById: (id: number) => api.get(`/notes/${id}`),
  update: (id: number, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
  toggleFavorite: (id: number) => api.post(`/notes/${id}/favorite`),
  togglePin: (id: number) => api.post(`/notes/${id}/pin`),
};

export const linksAPI = {
  create: (data: any) => api.post('/links', data),
  getAll: (params?: any) => api.get('/links', { params }),
  update: (id: number, data: any) => api.put(`/links/${id}`, data),
  delete: (id: number) => api.delete(`/links/${id}`),
};

export const vaultAPI = {
  create: (data: any) => api.post('/vault', data),
  getAll: () => api.get('/vault'),
  view: (id: number, secondaryPassword: string) => 
    api.post(`/vault/${id}/view`, { secondary_password: secondaryPassword }),
  update: (id: number, data: any) => api.put(`/vault/${id}`, data),
  delete: (id: number, secondaryPassword: string) =>
    api.delete(`/vault/${id}`, { data: { secondary_password: secondaryPassword } }),
};

export const categoriesAPI = {
  getAll: (type?: string) => api.get('/categories', { params: { type } }),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const searchAPI = {
  search: (query: string, type?: string) => api.get('/search', { params: { q: query, type } }),
};

export const backupAPI = {
  create: () => api.post('/backup/create'),
  getAll: () => api.get('/backup'),
  download: (id: number) => api.get(`/backup/${id}/download`, { responseType: 'blob' }),
  restore: (formData: FormData) => api.post('/backup/restore', formData),
};

export const logsAPI = {
  getAll: (params?: any) => api.get('/logs', { params }),
};