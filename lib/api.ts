// API configuration and utilities for connecting to Java Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: string
}

export interface Post {
  id: string
  content: string
  authorId: string
  author: User
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  createdAt: string
}

export interface CreatePostRequest {
  content: string
}

export interface CreateCommentRequest {
  content: string
  postId: string
}

// API client class
export class ApiClient {
  private baseUrl: string
  private token?: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      return {
        data,
        status: response.status,
        message: data.message,
      }
    } catch (error) {
      console.error("[v0] API request failed:", error)
      throw new Error("Network request failed")
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/users/me")
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`)
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Post endpoints
  async getPosts(page = 0, size = 10): Promise<ApiResponse<Post[]>> {
    return this.request<Post[]>(`/posts?page=${page}&size=${size}`)
  }

  async getPostById(id: string): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${id}`)
  }

  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    return this.request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deletePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${id}`, {
      method: "DELETE",
    })
  }

  async likePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${id}/like`, {
      method: "POST",
    })
  }

  async unlikePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${id}/like`, {
      method: "DELETE",
    })
  }

  // Comment endpoints
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/posts/${postId}/comments`)
  }

  async createComment(data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    return this.request<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/comments/${id}`, {
      method: "DELETE",
    })
  }

  // Follow endpoints
  async followUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/follow`, {
      method: "POST",
    })
  }

  async unfollowUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/follow`, {
      method: "DELETE",
    })
  }

  async getFollowers(userId: string): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`/users/${userId}/followers`)
  }

  async getFollowing(userId: string): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`/users/${userId}/following`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
