# Setting Up Google Authentication with Supabase

The error you are seeing (`Unsupported provider: provider is not enabled`) means that Google Authentication has not been enabled in your Supabase project dashboard.

Follow these steps to enable it and ensure it works on both Laptop and Mobile.

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select your existing one.
3. Search for **"GoogleAuth"** or go to **APIs & Services > OAuth consent screen**.
4. **OAuth Consent Screen**:
   - Select **External**.
   - Fill in "App Name", "User Support Email", and "Developer Contact Information".
   - Click **Save and Continue** (you can skip scopes for now).
5. **Credentials**:
   - Go to **Credentials** on the left menu.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Supabase Auth` (or similar).
   - **Authorized JavaScript origins**:
     - Add: `http://localhost:5173`
     - Add: `https://<your-project-ref>.supabase.co` (You can find this in Supabase Dashboard > Settings > API).
   - **Authorized redirect URIs**:
     - Add: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - **Note**: Replace `<your-project-ref>` with your actual project ID from the `.env` file (the part before `.supabase.co` in `VITE_SUPABASE_URL`).
   - Click **Create**.
6. Copy the **Client ID** and **Client Secret**.

## 2. Supabase Dashboard Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Authentication** (icon on the left) > **Providers**.
4. Click on **Google**.
5. Toggle **Enable Sign in with Google**.
6. Paste the **Client ID** and **Client Secret** you copied from Google Cloud.
7. Click **Save**.

## 3. Configure Redirect URLs (Crucial for Mobile)

For authentication to work on your mobile device (which connects via your local Network IP, e.g., `192.168.1.x`), you must whitelist that URL.

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2. Under **Redirect URLs**, add the following:
   - `http://localhost:5173` (Already likely there)
   - `http://<your-laptop-ip>:5173` (Example: `http://192.168.1.5:5173`)
   - `https://<your-deployment-url>.vercel.app` (If you deploy later)

**To find your laptop IP:**
- **Windows**: Open terminal, run `ipconfig`. Look for `IPv4 Address`.

## 4. Testing

1. Restart your dev server: `npm run dev -- --host` (The `--host` flag exposes it to your network).
2. **On Laptop**: user `http://localhost:5173`.
3. **On Mobile**: Open Chrome/Safari and visit `http://<your-laptop-ip>:5173`.
4. Try to sign in with Google.

## Troubleshooting

- **Error: redirect_uri_mismatch**: This means the URL you are trying to sign in from is not in the "Redirect URLs" list in Supabase.
- **Error: 400 validation_failed**: Google Provider is not enabled (Fix with Step 2).
