import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export type UserRole = 'buyer' | 'seller' | 'both'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at?: string
  updated_at?: string
}

interface AuthStore {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUserRole: (role: UserRole) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false, // Start with false, will be set to true when checking

      signUp: async (email, password, role) => {
        try {
          set({ loading: true })
          
          // Sign up with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          })

          if (authError) {
            set({ loading: false })
            return { error: authError as Error }
          }

          if (!authData.user) {
            set({ loading: false })
            return { error: new Error('Failed to create user') }
          }

          // Wait a moment for the trigger to create the profile (if it exists)
          await new Promise(resolve => setTimeout(resolve, 300))

          // First, check if profile already exists (from trigger)
          const { data: existingProfile, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          // If profile exists, update it with the selected role
          if (existingProfile) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                email: email,
                role: role,
                updated_at: new Date().toISOString(),
              })
              .eq('id', authData.user.id)

            if (updateError) {
              console.error('Error updating profile:', updateError)
              await supabase.auth.signOut()
              set({ loading: false })
              const errorMessage = updateError.code === '42P01' 
                ? 'Database table not found. Please run the SQL migration in Supabase.'
                : (updateError.message || `Failed to update profile: ${updateError.code || 'Unknown error'}`)
              return { 
                error: new Error(errorMessage)
              }
            }
          } else {
            // Profile doesn't exist, try to create it
            // Check if it's a table not found error
            if (checkError && (checkError.code === '42P01' || checkError.message?.includes('does not exist'))) {
              await supabase.auth.signOut()
              set({ loading: false })
              return { 
                error: new Error('Database table not found. Please run the SQL migration in Supabase.') 
              }
            }

            // Try to insert new profile
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: authData.user.id,
                  email: email,
                  role: role,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ])

            // If insert fails due to duplicate key, the profile already exists (from trigger)
            // So try to update it instead
            if (insertError) {
              if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique constraint')) {
                // Profile exists, update it instead
                console.log('Profile already exists from trigger, updating with selected role...')
                const { error: updateError } = await supabase
                  .from('user_profiles')
                  .update({
                    email: email,
                    role: role,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', authData.user.id)

                if (updateError) {
                  console.error('Error updating existing profile:', updateError)
                  await supabase.auth.signOut()
                  set({ loading: false })
                  return { 
                    error: new Error(`Failed to update profile: ${updateError.message || updateError.code || 'Unknown error'}`)
                  }
                }
              } else {
                // Different error, fail
                console.error('Error creating profile:', insertError)
                await supabase.auth.signOut()
                set({ loading: false })
                const errorMessage = insertError.code === '42P01'
                  ? 'Database table not found. Please run the SQL migration in Supabase.'
                  : (insertError.message || `Failed to create profile: ${insertError.code || 'Unknown error'}`)
                return { 
                  error: new Error(errorMessage)
                }
              }
            }
          }

          // Small delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 100))

          const { data: profileData, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (fetchError || !profileData) {
            console.error('Error fetching profile:', fetchError)
            // Still sign out if profile fetch fails
            await supabase.auth.signOut()
            set({ loading: false })
            const errorMessage = fetchError?.code === '42P01'
              ? 'Database table not found. Please run the SQL migration in Supabase.'
              : (fetchError?.message || 'Failed to fetch profile. Please check database setup.')
            return { 
              error: new Error(errorMessage)
            }
          }

          set({
            user: {
              id: profileData.id,
              email: profileData.email,
              role: profileData.role,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at,
            },
            loading: false,
          })

          return { error: null }
        } catch (error) {
          set({ loading: false })
          return { error: error as Error }
        }
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false })
            return { error: error as Error }
          }

          if (!data.user) {
            set({ loading: false })
            return { error: new Error('Failed to sign in') }
          }

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError || !profileData) {
            // If profile doesn't exist, create one with buyer as default
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: data.user.id,
                  email: email,
                  role: 'buyer',
                },
              ])
              .select()
              .single()

            if (createError || !newProfile) {
              await supabase.auth.signOut()
              set({ loading: false })
              return { error: createError as Error || new Error('Failed to create profile') }
            }

            set({
              user: {
                id: newProfile.id,
                email: newProfile.email,
                role: newProfile.role,
                created_at: newProfile.created_at,
                updated_at: newProfile.updated_at,
              },
              loading: false,
            })
          } else {
            set({
              user: {
                id: profileData.id,
                email: profileData.email,
                role: profileData.role,
                created_at: profileData.created_at,
                updated_at: profileData.updated_at,
              },
              loading: false,
            })
          }

          return { error: null }
        } catch (error) {
          set({ loading: false })
          return { error: error as Error }
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null, loading: false })
        } catch (error) {
          console.error('Error signing out:', error)
          set({ user: null, loading: false })
        }
      },

      checkAuth: async () => {
        try {
          console.log('checkAuth: Starting auth check...')
          set({ loading: true })
          const { data: { session } } = await supabase.auth.getSession()
          console.log('checkAuth: Session check result', { hasSession: !!session, userId: session?.user?.id })

          if (!session?.user) {
            console.log('checkAuth: No session found')
            set({ user: null, loading: false })
            return
          }

          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error || !profileData) {
            console.log('checkAuth: Error fetching profile', error)
            set({ user: null, loading: false })
            return
          }

          console.log('checkAuth: Profile found', profileData.email)
          set({
            user: {
              id: profileData.id,
              email: profileData.email,
              role: profileData.role,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at,
            },
            loading: false,
          })
          console.log('checkAuth: Auth check complete, user set')
        } catch (error) {
          console.error('checkAuth: Error checking auth:', error)
          set({ user: null, loading: false })
        }
      },

      updateUserRole: async (role) => {
        const currentUser = get().user
        if (!currentUser) return

        try {
          const { error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('id', currentUser.id)

          if (error) {
            console.error('Error updating role:', error)
            return
          }

          set({
            user: {
              ...currentUser,
              role,
            },
          })
        } catch (error) {
          console.error('Error updating role:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Listen to auth state changes (only on client side)
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    const store = useAuthStore.getState()
    
    if (session?.user) {
      // Only check auth if we don't already have a user loaded
      // This prevents unnecessary loading states after successful login
      if (!store.user || store.user.id !== session.user.id) {
        store.checkAuth()
      }
    } else {
      // User signed out
      useAuthStore.setState({ user: null, loading: false })
    }
  })
}
