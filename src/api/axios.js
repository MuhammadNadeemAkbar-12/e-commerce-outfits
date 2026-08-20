import axios from "axios";
// Import pinia store access to read token in-memory when available
import { useAuthStore } from '@/stores/auth'
import { getCurrentInstance } from 'vue'

// Derive API base URL with priority:
// 1. Explicit Vite env variable (import.meta.env.VITE_API_BASE_URL)
// 2. Fallback to window.__API_BASE_URL__ (can be injected via script tag if needed)
// 3. Same-origin API path. Production deployments should set VITE_API_BASE_URL to an HTTPS API origin.
const FALLBACK_API = "/api";
let resolvedBase = FALLBACK_API;
try {
  if (import.meta?.env?.VITE_API_BASE_URL) {
    resolvedBase = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  } else if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    resolvedBase = String(window.__API_BASE_URL__).replace(/\/$/, '');
  }
} catch (e) {
  // ignore – retain fallback
}

const axiosInstance = axios.create({
  baseURL: resolvedBase,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Prefer in-memory token from Pinia store when available.
      // Using a direct import and calling the store works outside of setup.
      const auth = useAuthStore()
      const token = auth?.token || null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        return config
      }
    } catch (e) {
      // If Pinia isn't available for some reason, fall back to localStorage.
    }

    // Fallback: read from sessionStorage (token not persisted across tab close)
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
