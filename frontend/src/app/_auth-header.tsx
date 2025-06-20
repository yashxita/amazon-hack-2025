'use client'

import { useEffect } from 'react'
import axios from 'axios'

/**
 * Once on first client render:
 *   – pull JWT from localStorage
 *   – push it into Axios default headers
 */
export default function AttachAuthHeader() {
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  return null   // nothing to render
}
