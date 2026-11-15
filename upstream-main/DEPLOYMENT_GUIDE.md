# 🚀 Production Deployment Guide

This comprehensive guide will walk you through deploying the Lawyer Opportunity Hub to production.

## 📋 Pre-Deployment Checklist

### ✅ Code Verification
- [ ] All code committed to main branch
- [ ] HashRouter is configured (✅ Already configured)
- [ ] `public/_redirects` file exists (✅ Already exists)
- [ ] Environment variables are not hardcoded
- [ ] All linting passes

### ✅ Environment Setup
- [ ] `.env.local` file created with real values
- [ ] Supabase secrets configured
- [ ] SUPABASE_SERVICE_ROLE_KEY set in Netlify
- [ ] WhatsApp Business API credentials ready
- [ ] OpenAI API key available

## 🔧 Step 1: Environment Configuration

### Frontend Environment
The frontend uses hardcoded Supabase configuration:
- **URL**: `https://mlnwpocuvjnelttvscja.supabase.co`
- **Anon Key**: Already configured in `src/integrations/supabase/client.ts`

### Backend Environment (if using Express server)
Create `.env.local` in the root directory:
```env
SUPABASE_URL="https://mlnwpocuvjnelttvscja.supabase.co"
SUPABASE_SERVICE_ROLE="your-service-role-key"
CLIENT_ORIGIN="https://your-production-domain.com"
PORT=4000
WHATSAPP_PHONE_ID="your-whatsapp-phone-id"
WHATSAPP_TOKEN="your-whatsapp-token"
VITE_OPENAI_API_KEY="your-openai-api-key"
```

### Supabase Secrets Configuration
Store sensitive API keys in Supabase Secrets:

1. **Navigate to Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/mlnwpocuvjnelttvscja/settings/functions

2. **Add the following secrets**:
   - `WHATSAPP_TOKEN`: Your WhatsApp Business API token
   - `WHATSAPP_PHONE_ID`: Your WhatsApp phone number ID
   - `OPENAI_API_KEY`: Your OpenAI API key

## 🏗️ Step 2: Build Process

### Install Dependencies
```bash
npm install
```

### Run Quality Checks
```bash
# Lint the code
npm run lint

# Fix any linting issues
npm run lint -- --fix
```

### Build for Production
```bash
npm run build
```

This creates a `dist` folder with optimized static files.

## 🌐 Step 3: Frontend Deployment

### Option A: Netlify Deployment

1. **Deploy via Drag & Drop**:
   - Go to [Netlify](https://app.netlify.com/)
   - Drag the `dist` folder to the deploy area

2. **Deploy via Git** (Recommended):
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Configure Environment Variables** in Netlify:
   - Go to Site Settings > Environment Variables
   - Add `SUPABASE_SERVICE_ROLE_KEY` with your Supabase service role secret

4. **Custom Domain** (Optional):
   - Go to Domain Management
   - Add your custom domain

### Option B: Vercel Deployment

1. **Connect Repository**:
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**:
   - Add environment variables in Vercel dashboard

### Verify Frontend Deployment
- [ ] Site loads without errors
- [ ] Routes work correctly (no 404s on direct links)
- [ ] Authentication flow works
- [ ] Protected routes redirect properly

## 🖥️ Step 4: Backend Deployment (Optional)

If you're using the Express server in the `server/` directory:

### Option A: Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option B: Render Deployment
1. Connect your GitHub repository
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && node app.js`
4. Configure environment variables

### Option C: Heroku Deployment
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_ROLE=your-key

# Deploy
git push heroku main
```

## 🔧 Step 5: Database & Edge Functions

### Database Setup
The database is already configured in Supabase. No additional setup needed.

### Edge Functions Deployment
Edge functions are automatically deployed with your Supabase project:

1. **WhatsApp Webhook**: `/functions/whatsapp-webhook`
   - Handles incoming WhatsApp messages
   - Creates leads automatically
   - Sends acknowledgment messages

2. **AI Summary**: `/functions/ai-summary`
   - Generates business insights
   - Analyzes leads and cases
   - Provides actionable recommendations

### Webhook Configuration
Configure WhatsApp webhook URL in Meta Business:
```
https://mlnwpocuvjnelttvscja.supabase.co/functions/v1/whatsapp-webhook
```

## 🧪 Step 6: Testing & Verification

### Automated Testing
```bash
# Run the deployment preparation script
chmod +x deploy.sh
./deploy.sh
```

### Manual Testing Checklist
- [ ] **Authentication**: Sign up and login work
- [ ] **Navigation**: All routes accessible
- [ ] **Lead Management**: Can create and manage leads
- [ ] **Client Management**: Can view and manage clients
- [ ] **Case Management**: Can create and track cases
- [ ] **Calendar**: Meeting scheduling works
- [ ] **Payments**: Payment interface loads
- [ ] **API Health**: `/api/health` returns `{"ok": true}`

### WhatsApp Integration Testing
1. Send a message to your WhatsApp Business number
2. Verify lead is created in the database
3. Check acknowledgment message is sent

### AI Integration Testing
1. Create a new lead with description
2. Verify AI classification works
3. Test AI summary generation

GitHub pull request sync

Create a webhook in GitHub project settings pointing to the /github-pr-sync path of the deployed backend. Use application/json as content type and add a secret. Store the same secret in the handler configuration.

Supabase requirements

Grant the service role insert and update access to tables used by pull request sync. The anon role only needs read. Set environment variables SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE and GITHUB_WEBHOOK_SECRET.

Webhook testing

Send a pull request event with curl:

```
curl -X POST https://your-domain/github-pr-sync \
  -H 'X-GitHub-Event: pull_request' \
  -H 'X-Hub-Signature-256: provided-signature' \
  -H 'Content-Type: application/json' \
  -d '{"action":"opened"}'
```

The same request can be issued in Postman by creating a POST request with the same headers and body.

## 🚨 Troubleshooting

### Common Issues

#### 1. 404 Errors on Route Refresh
**Problem**: Direct links to routes return 404
**Solution**: 
- Verify `public/_redirects` contains: `/*    /index.html   200`
- Ensure `HashRouter` is used in `src/App.tsx`

#### 2. Environment Variables Not Working
**Problem**: API calls fail due to missing credentials
**Solution**:
- Check Supabase secrets are configured correctly
- Verify hosting platform environment variables
- Ensure no hardcoded values in production code

#### 3. WhatsApp Webhook Not Working
**Problem**: Messages not creating leads
**Solution**:
- Verify webhook URL in Meta Business
- Check Supabase function logs
- Ensure `WHATSAPP_TOKEN` secret is set

#### 4. Build Failures
**Problem**: `npm run build` fails
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Fix linting issues
npm run lint -- --fix

# Try building again
npm run build
```

### Getting Help
- **Logs**: Check browser console and network tab
- **Supabase Logs**: Monitor function execution logs
- **Documentation**: https://docs.lovable.dev/tips-tricks/troubleshooting

## 📊 Post-Deployment Monitoring

### Performance Monitoring
- Monitor page load times
- Check Core Web Vitals
- Monitor API response times

### Error Monitoring
- Set up error tracking (Sentry recommended)
- Monitor Supabase function logs
- Track authentication errors

### Business Metrics
- Lead conversion rates
- User engagement metrics
- System uptime monitoring

## 🔒 Security Checklist

- [ ] **HTTPS**: Site serves over HTTPS
- [ ] **Secrets**: No API keys in frontend code
- [ ] **CORS**: Proper CORS configuration
- [ ] **RLS**: Row Level Security enabled
- [ ] **Authentication**: Email verification works
- [ ] **Permissions**: Role-based access working

## 🎯 Success Criteria

Your deployment is successful when:
- [ ] Frontend loads without errors
- [ ] All routes are accessible
- [ ] Authentication flow works
- [ ] Database operations succeed
- [ ] WhatsApp integration functions
- [ ] AI features are operational
- [ ] Performance is acceptable

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review [Lovable Documentation](https://docs.lovable.dev/)
3. Consult [Supabase Documentation](https://supabase.com/docs)
4. Contact the development team

---

**🎉 Congratulations!** Your Lawyer Opportunity Hub is now live in production!