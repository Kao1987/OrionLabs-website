// API 基本配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 獲取認證標頭
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('adminToken')
  const tokenType = localStorage.getItem('tokenType')
  
  if (token) {
    return {
      'Authorization': `${tokenType || 'Bearer'} ${token}`,
      'Content-Type': 'application/json'
    }
  }
  
  return {
    'Content-Type': 'application/json'
  }
}

// 通用 API 請求函數
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  }
  
  try {
    const response = await fetch(url, config)
    
    // 如果是401錯誤（未授權），清除token並重定向
    if (response.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('tokenType')
      window.location.href = '/'
      throw new Error('認證失效，請重新登入')
    }
    
    // 如果不是JSON回應，直接返回response
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return response
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`API請求失敗 ${endpoint}:`, error)
    throw error
  }
}

// 認證相關API
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me')
  }
}

// 部落格相關API
export const blogAPI = {
  // 公開API
  getPublishedPosts: async (params?: { skip?: number; limit?: number; category?: string }) => {
    const query = new URLSearchParams()
    if (params?.skip !== undefined) query.append('skip', params.skip.toString())
    if (params?.limit !== undefined) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    
    return apiRequest(`/api/blog/public?${query}`)
  },
  
  getPublishedPost: async (id: number) => {
    return apiRequest(`/api/blog/public/${id}`)
  },
  
  likePost: async (id: number) => {
    return apiRequest(`/api/blog/${id}/like`, { method: 'POST' })
  },
  
  // 管理員API
  getAllPosts: async (params?: { skip?: number; limit?: number; category?: string; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.skip !== undefined) query.append('skip', params.skip.toString())
    if (params?.limit !== undefined) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    if (params?.status) query.append('status', params.status)
    
    return apiRequest(`/api/blog?${query}`)
  },
  
  getPost: async (id: number) => {
    return apiRequest(`/api/blog/${id}`)
  },
  
  createPost: async (postData: any) => {
    return apiRequest('/api/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  },
  
  updatePost: async (id: number, postData: any) => {
    return apiRequest(`/api/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  },
  
  deletePost: async (id: number) => {
    return apiRequest(`/api/blog/${id}`, { method: 'DELETE' })
  }
}

// 作品集相關API
export const portfolioAPI = {
  // 公開API
  getPublishedItems: async (params?: { skip?: number; limit?: number; category?: string }) => {
    const query = new URLSearchParams()
    if (params?.skip !== undefined) query.append('skip', params.skip.toString())
    if (params?.limit !== undefined) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    
    return apiRequest(`/api/portfolio/public?${query}`)
  },
  
  getPublishedItem: async (id: number) => {
    return apiRequest(`/api/portfolio/public/${id}`)
  },
  
  // 管理員API
  getAllItems: async (params?: { skip?: number; limit?: number; category?: string; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.skip !== undefined) query.append('skip', params.skip.toString())
    if (params?.limit !== undefined) query.append('limit', params.limit.toString())
    if (params?.category) query.append('category', params.category)
    if (params?.status) query.append('status', params.status)
    
    return apiRequest(`/api/portfolio?${query}`)
  },
  
  getItem: async (id: number) => {
    return apiRequest(`/api/portfolio/${id}`)
  },
  
  createItem: async (itemData: any) => {
    return apiRequest('/api/portfolio', {
      method: 'POST',
      body: JSON.stringify(itemData)
    })
  },
  
  updateItem: async (id: number, itemData: any) => {
    return apiRequest(`/api/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    })
  },
  
  deleteItem: async (id: number) => {
    return apiRequest(`/api/portfolio/${id}`, { method: 'DELETE' })
  }
}

// 統計相關API
export const statsAPI = {
  getStats: async () => {
    return apiRequest('/api/stats')
  }
}

// 健康檢查API
export const healthAPI = {
  check: async () => {
    return apiRequest('/health')
  }
} 