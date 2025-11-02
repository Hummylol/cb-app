# Quick Fix for Signup Error

The error "Error creating profile: {}" means the `user_profiles` table doesn't exist in your Supabase database yet.

## Solution: Run the SQL Migration

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the entire contents of `supabase-migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify the Table Was Created**
   - Go to "Table Editor" in the left sidebar
   - You should see `user_profiles` table with columns:
     - `id` (UUID, primary key)
     - `email` (text)
     - `role` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

5. **Try Signing Up Again**
   - Go back to your app
   - Navigate to `/signup`
   - Try creating an account again

## Alternative: Manual Table Creation

If the migration script fails, you can create the table manually:

```sql
-- Create the table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'both')) DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

## Common Issues

### Issue: "relation does not exist"
- **Solution**: The table wasn't created. Make sure you ran the migration SQL.

### Issue: "permission denied"
- **Solution**: Make sure RLS policies are set up correctly. Re-run the migration SQL.

### Issue: "duplicate key value"
- **Solution**: This means the profile already exists. The code has been fixed to handle this with upsert, but if you see this, the user profile might already exist in the database.

### Issue: Trigger conflicts
- **Solution**: The migration now handles this with `ON CONFLICT` in both the trigger and the app code.

## Still Having Issues?

Check the browser console for detailed error messages. The improved error handling should now tell you exactly what's wrong:
- "Database table not found" → Run the migration SQL
- "Failed to create profile" → Check RLS policies
- Any other message → Check the specific error details

