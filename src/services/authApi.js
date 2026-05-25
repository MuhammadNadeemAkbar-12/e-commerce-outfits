import axios from '@/api/axios'

class AuthService {
  // Login endpoint
  async login(credentials) {
    try {
      const response = await axios.post('/login', {
        email: credentials.email,
        password: credentials.password
      })

      // Debug: log actual response so we can see structure in browser console
      console.log('[authApi] login raw response:', JSON.stringify(response.data))

      // Handle multiple possible response structures from backend
      const data = response.data
      // Support: { data: { user, token, roles } }  OR  { user, token, roles/role }
      const payload = data?.data || data
      const userData = payload?.user || payload
      // Support roles array OR single role string
      const rolesRaw = payload?.roles ?? payload?.role
      const roles = Array.isArray(rolesRaw)
        ? rolesRaw.map(r => (typeof r === 'object' ? r?.name : r))
        : rolesRaw ? [typeof rolesRaw === 'object' ? rolesRaw?.name : rolesRaw] : []

      const token = payload?.token || payload?.access_token || data?.token

      if (!token) {
        console.error('[authApi] No token in response. payload:', payload)
        return { success: false, message: 'No token received from server' }
      }

      const role = roles[0] || null
      console.log('[authApi] Parsed → role:', role, '| token:', token ? 'present' : 'missing')

      return {
        success: true,
        user: { ...userData, role },
        token
      }
    } catch (error) {
      console.error('[authApi] login error:', error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // Register endpoint
  async register(userData) {
    try {
      const response = await axios.post('/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      })
      
      const userDataResponse = response.data.data.user
      const roles = response.data.data.roles
      
      return {
        success: true,
        user: {
          ...userDataResponse,
          role: roles[0]
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await axios.get('/profile')
      const userData = response.data.data.user
      const roles = response.data.data.roles
      
      return {
        success: true,
        user: {
          ...userData,
          role: roles[0]
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      }
    }
  }

  // Update profile
  async updateProfile(userData) {
    try {
      const response = await axios.put('/profile', userData)
      const userDataResponse = response.data.data.user
      const roles = response.data.data.roles
      
      return {
        success: true,
        user: {
          ...userDataResponse,
          role: roles[0]
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      }
    }
  }

  // Logout endpoint
  async logout() {
    try {
      await axios.post('/logout')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed'
      }
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await axios.post('/refresh')
      const token = response.data.data.token
      
      return {
        success: true,
        token: token
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed'
      }
    }
  }

  // Request password reset email
  async forgotPassword(email) {
    try {
      const response = await axios.post('/forgot-password', { email })
      return {
        success: true,
        message: response.data?.message || 'Password reset link sent successfully.'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link'
      }
    }
  }

  // Reset password using email + token + new password
  async resetPassword(payload) {
    try {
      const response = await axios.post('/reset-password', payload)
      return {
        success: true,
        message: response.data?.message || 'Password reset successful.'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      }
    }
  }
}

export default new AuthService()
