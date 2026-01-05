import axios from "axios";
import { useAuthStore } from '@/stores/auth'

// Use relative path - Vercel will proxy it to your backend
const axiosInstance = axios.create({
  baseURL: '/api',  // Relative to current domain
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const auth = useAuthStore()
      const token = auth?.token || null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        return config
      }
    } catch (e) {
      // If Pinia isn't available for some reason, fall back to sessionStorage.
    }

    // Fallback: read from sessionStorage
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const publicPaths = [/^\/products/, /^\/categories-products/];
    const cfg = error.config || {};
    const skip = cfg.skipAuthRedirect;
    const status = error.response?.status;
    
    if (status === 401 && !skip) {
      const isPublic = publicPaths.some((r) => r.test(cfg.url || ""));
      if (!isPublic) {
        // optional: redirect or logout
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
