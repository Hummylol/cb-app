# Authentication Setup Guide

This document explains the authentication system that has been implemented in your rental marketplace app.

## Features Implemented

✅ **Login & Signup Pages** - Mobile-first design with beautiful UI
✅ **Role-based Access Control** - Users can be buyers, sellers, or both
✅ **Protected Routes** - All pages require authentication
✅ **Role-based Navigation** - Sell option only visible to sellers/both
✅ **Supabase Integration** - User profiles stored in Supabase database

## Database Setup

Before using the authentication features, you need to set up the database table in Supabase:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the SQL script from `supabase-migration.sql`
4. This will create:
   - `user_profiles` table with role field
   - Row Level Security policies
   - Automatic profile creation trigger

## User Roles

- **buyer**: Can only buy/rent products
- **seller**: Can only sell/list products  
- **both**: Can both buy and sell products

## Pages Created

### `/login`
- Email and password login
- Mobile-first responsive design
- Link to signup page
- Redirects to home if already logged in

### `/signup`
- Email, password, and role selection
- Role options: Buyer, Seller, or Both
- Password confirmation
- Mobile-first responsive design
- Link to login page
- Redirects to home if already logged in

## Protected Routes

All main pages now require authentication:
- `/` (Home page) - Requires login
- `/sell` - Requires login AND seller/both role
- `/cart` - Requires login (if it exists)
- `/wishlist` - Requires login (if it exists)

## Navigation Updates

The Navigation component now:
- Shows "Sell" button only for users with seller or both role
- Shows "Sign in" / "Sign up" buttons when not logged in
- Shows "Sign out" button when logged in
- Automatically updates based on user role

## Authentication Store

The authentication state is managed by `src/lib/auth-store.ts`:
- Uses Zustand for state management
- Persists user data in localStorage
- Automatically syncs with Supabase auth state
- Provides `signUp`, `signIn`, `signOut`, `checkAuth` methods

## Usage Examples

### Check if user is logged in:
```tsx
import { useAuthStore } from '@/lib/auth-store'

const { user, loading } = useAuthStore()
if (user) {
  // User is logged in
}
```

### Check if user is seller:
```tsx
const { user } = useAuthStore()
const isSeller = user?.role === 'seller' || user?.role === 'both'
```

### Protect a component:
```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Environment Variables

Make sure you have these set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

1. Navigate to `/signup` to create a new account
2. Select your role (buyer, seller, or both)
3. Sign up with your email and password
4. You'll be redirected to the home page
5. Check if the "Sell" button appears based on your role
6. Try accessing `/sell` - it should only work for sellers/both
7. Sign out and try accessing protected pages - you'll be redirected to login

## Notes

- The user profile is automatically created when signing up
- If a user logs in without a profile, one is created with 'buyer' as default role
- All authentication state is synced with Supabase auth
- The app listens to auth state changes automatically

