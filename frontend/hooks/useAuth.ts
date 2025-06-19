"use client"
import { useState, useEffect } from "react"
import { getCurrentUser, getStoredToken, removeStoredToken, type User } from "../services/api"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getStoredToken()
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Auth check failed:", error)
      removeStoredToken()
    } finally {
      setLoading(false)
    }
  }

  const login = (token: string, userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    removeStoredToken()
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
