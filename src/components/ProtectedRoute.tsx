'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading, checkAuth } = useAuthStore()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Check auth once on mount
    const initAuth = async () => {
      if (!hasChecked) {
        setHasChecked(true)
        // If we already have a user from persisted state, verify it's still valid
        // but don't block rendering if user exists
        if (user) {
          console.log('ProtectedRoute: User exists in state, verifying session...', user.email)
          // Silently verify in background
          checkAuth().catch(err => {
            console.error('ProtectedRoute: Error verifying auth', err)
          })
        } else {
          console.log('ProtectedRoute: No user in state, checking auth...')
          await checkAuth()
          console.log('ProtectedRoute: Auth check complete')
        }
      }
    }
    initAuth()
  }, [checkAuth, hasChecked, user])

  useEffect(() => {
    // Redirect to login if not loading and no user (after check is complete)
    if (hasChecked && !loading && !user) {
      console.log('ProtectedRoute: No user found, redirecting to login')
      router.push('/login')
    } else if (hasChecked && !loading && user) {
      console.log('ProtectedRoute: User authenticated', user.email)
    }
  }, [loading, user, router, hasChecked])

  // Show loading while checking auth (only if we don't have a user yet)
  // If user exists, don't block rendering while verifying
  if ((!hasChecked || loading) && !user) {
    console.log('ProtectedRoute: Loading state (no user yet)', { hasChecked, loading })
    return <LoadingSpinner message="Loading..." />
  }

  // If no user after check, return null (redirect will happen via useEffect)
  if (!user) {
    console.log('ProtectedRoute: No user, waiting for redirect')
    return null
  }

  // User is authenticated, show children
  console.log('ProtectedRoute: Rendering children for user', user.email)
  return <>{children}</>
}
