# Lawyer Opportunity Hub

A comprehensive platform connecting lawyers with potential clients through intelligent lead matching and case management.

## 🚀 Features

- **Lead Management**: AI-powered lead classification and matching
- **Client Management**: Complete client lifecycle management
- **Case Tracking**: Comprehensive case management with status tracking
- **Calendar Integration**: Schedule meetings and track appointments
- **Payment Processing**: Integrated payment and escrow services
- **Real-time Messaging**: WhatsApp integration for client communication
- **Digital Contracts**: E-signature and contract management
- **Analytics & Reports**: Performance tracking and business insights

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6 with HashRouter
- **Styling**: Tailwind CSS with dark/light theme support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- WhatsApp Business API access (optional)
- OpenAI API key (optional)

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration

#### For Development:
Create `.env.local` file in the root directory:
```bash
# Copy from .env.example
cp .env.example .env.local
```

Fill in the actual values in `.env.local`:
```env
SUPABASE_URL="https://mlnwpocuvjnelttvscja.supabase.co"
SUPABASE_SERVICE_ROLE="your-actual-service-role-key"
CLIENT_ORIGIN="http://localhost:5173"
PORT=4000
WHATSAPP_PHONE_ID="your-whatsapp-phone-id"
WHATSAPP_TOKEN="your-whatsapp-token"
VITE_OPENAI_API_KEY="your-openai-api-key"
```

#### For Production:
Set environment variables in your hosting platform (Netlify, Vercel, etc.)

### 4. Database Setup

The application uses Supabase with the following main tables:
- `profiles` - User profiles and roles
- `leads` - Potential client inquiries
- `lawyers` - Lawyer profiles and specializations
- `cases` - Legal cases and matters
- `payments` - Payment and billing records
- `meetings` - Scheduled appointments
- `contracts` - Digital contracts and signatures

### 5. Supabase Secrets (Production)

For production deployment, store sensitive API keys in Supabase Secrets:

1. Go to [Supabase Dashboard > Edge Functions > Secrets](https://supabase.com/dashboard/project/mlnwpocuvjnelttvscja/settings/functions)
2. Add the following secrets:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_ID`
   - `OPENAI_API_KEY`

## 🚀 Development

### Start the development server:
```bash
npm run dev
```

### Run the backend server (if using Express):
```bash
cd server
npm install
npm start
```

### Run linting:
```bash
npm run lint
```

### Build for production:
```bash
npm run build
```

## 📦 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

3. **Configure redirects:** The `public/_redirects` file handles SPA routing:
   ```
   /*    /index.html   200
   ```

4. **Set environment variables** in your hosting platform dashboard

### Backend Deployment

If using the Express server in `server/`:

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set environment variables** on your server platform

3. **Start the server:**
   ```bash
   node app.js
   ```

### Deployment Checklist

- [ ] Environment variables configured in hosting platform
- [ ] Supabase secrets configured for API keys
- [ ] `_redirects` file included in build
- [ ] Database migrations applied
- [ ] API health check accessible (`/api/health`)
- [ ] Frontend routes working (no 404s)
- [ ] WhatsApp integration functional
- [ ] AI classification working

## 🔐 Authentication & Security

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (admin, lawyer, customer, lead_provider)
- **Email verification** required in production
- **Secure API keys** stored in Supabase Secrets
- **CORS configuration** for production domains

## 📱 Features Overview

### Lead Management
- AI-powered lead classification using OpenAI
- WhatsApp integration for automatic responses
- Lead assignment and matching algorithms
- Priority and urgency tracking

### Client Management
- Complete client profiles and history
- Communication tracking
- Document management
- Payment history

### Case Management
- Case lifecycle tracking
- Document attachments
- Timeline and milestones
- Status updates and notifications

### Calendar & Meetings
- Meeting scheduling
- Calendar integration
- Automated reminders
- Video call integration

### Payments & Billing
- Secure payment processing
- Escrow services
- Commission tracking
- Invoice generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Review the [Troubleshooting Guide](https://docs.lovable.dev/tips-tricks/troubleshooting)
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.
