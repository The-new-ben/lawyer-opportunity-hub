# Complete Environment Setup Guide

This guide covers the complete environment setup for the Lawyer Opportunity Hub application.

## Architecture Overview

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Authentication + Edge Functions)
- **Routing**: React Router with HashRouter for static hosting
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query + React hooks

## Environment Configuration

### Environment Variables

1. Copy `.env.example` to `.env.local`.
2. Provide values for:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NETLIFY_AUTH_TOKEN`
3. In Netlify, add these variables in **Site settings > Build & deploy > Environment**.
4. In GitHub, create repository secrets with the same names under **Settings > Secrets and variables > Actions** so CI and Netlify builds use identical configuration.

### 1. Supabase Configuration

The Supabase client is pre-configured in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://mlnwpocuvjnelttvscja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**No additional configuration needed** - authentication and database access work automatically.

### 2. External API Keys (Supabase Secrets)

All sensitive API keys are stored as Supabase Secrets:

#### Required Secrets:
- `OPENAI_API_KEY` - For AI classification and responses
- `WHATSAPP_TOKEN` - For WhatsApp Cloud API integration
- `WHATSAPP_PHONE_ID` - WhatsApp phone number ID

For local development, set `VITE_OPENAI_API_KEY` in your `.env` file.

#### Configure Secrets:
1. Go to [Supabase Dashboard > Secrets](https://supabase.com/dashboard/project/mlnwpocuvjnelttvscja/settings/functions)
2. Add each secret with its value
3. Edge Functions automatically access them via `Deno.env.get('SECRET_NAME')`

### 3. Sentry Configuration

Set the Sentry DSN to enable error tracking:

```bash
VITE_SENTRY_DSN=your_sentry_dsn
```

### 4. Development Environment

#### Prerequisites:
```bash
node >= 18.0.0
npm >= 8.0.0
```

#### Installation:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 5. Production Deployment

#### Static Hosting (Netlify, Vercel, GitHub Pages):
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Redirects file: `public/_redirects` (already configured)
4. No additional environment variables needed

#### Custom Server Deployment:
1. Set `CLIENT_ORIGIN` to your production domain
2. Configure `PORT` if needed (default: 4000)
3. Ensure Supabase Secrets are set for Edge Functions

## Application Structure

### Core Configuration Files

```
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration  
├── src/index.css          # Design system & CSS variables
├── src/integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client configuration
│       └── types.ts        # Auto-generated database types
├── supabase/
│   ├── config.toml         # Supabase project configuration
│   └── functions/          # Edge Functions
└── public/
    └── _redirects          # Static hosting redirects
```

### Design System

The application uses a comprehensive design system defined in `src/index.css`:

- **Colors**: HSL-based semantic tokens
- **Theme**: Professional legal industry palette
- **Dark Mode**: Fully supported via CSS variables
- **Components**: Shadcn/ui with custom variants

## Features & Integrations

### Implemented Features:
✅ User authentication (Supabase Auth)  
✅ Lead management with WhatsApp integration  
✅ AI-powered lead classification (OpenAI)  
✅ Client and case management  
✅ Payment processing system  
✅ Digital contract management  
✅ Calendar scheduling  
✅ Commission tracking  
✅ Rating and review system  
✅ Responsive design with dark mode  

### Edge Functions:
- `whatsapp-webhook` - Handles incoming WhatsApp messages
- `ai-summary` - AI-powered lead classification and responses

## Troubleshooting

### Common Issues:

1. **Routes returning 404**: Ensure `_redirects` file is in build output and HashRouter is used
2. **Supabase connection errors**: Check if client configuration is correct
3. **API key errors**: Verify Supabase Secrets are properly configured
4. **Build failures**: Run `npm run lint` to check for syntax errors

### Development Tips:

1. Use React DevTools for component debugging
2. Check Supabase Dashboard for database issues
3. Monitor Edge Function logs for API integration problems
4. Use browser console for client-side debugging

## Security Considerations

- ✅ No API keys in source code
- ✅ All secrets stored in Supabase Secrets
- ✅ Row Level Security (RLS) enabled on database tables
- ✅ Authentication required for protected routes
- ✅ CORS properly configured for Edge Functions

## Performance Optimizations

- ✅ Vite for fast development and optimized builds
- ✅ React.lazy() for code splitting
- ✅ TanStack Query for efficient data fetching
- ✅ Tailwind CSS for minimal bundle size
- ✅ HashRouter for static hosting compatibility

---

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)