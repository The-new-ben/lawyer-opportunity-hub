# מסמך תיעוד טכני מפורט - מערכת הזדמנויות עורכי דין

## 📋 תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [סטק טכנולוגי](#סטק-טכנולוגי)
4. [הקמת סביבת פיתוח](#הקמת-סביבת-פיתוח)
5. [מבנה הפרויקט](#מבנה-הפרויקט)
6. [בסיס הנתונים](#בסיס-הנתונים)
7. [Edge Functions](#edge-functions)
8. [API Documentation](#api-documentation)
9. [אבטחה](#אבטחה)
10. [פריסה ו-CI/CD](#פריסה-ו-cicd)
11. [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 סקירה כללית

**שם הפרויקט:** Lawyer Opportunity Hub  
**דומיין:** [jus-tice.com](https://jus-tice.com)  
**מטרה:** פלטפורמה דיגיטלית לחיבור בין לקוחות לעורכי דין עם AI חכם לניהול תיקים  

### תכונות עיקריות:
- ✅ **Smart Legal Intake** - קליטת מידע משפטי חכמה באמצעות AI
- ✅ **International Court** - בית משפט דיגיטלי עם סימולציות AI
- ✅ **Lead Management** - ניהול לידים עם אינטגרציה לוואטסאפ
- ✅ **Case Management** - ניהול תיקים מתקדם
- ✅ **Payment System** - מערכת תשלומים מלאה (Stripe)
- ✅ **Voice Transcription** - תמלול קולי (OpenAI Whisper)
- ✅ **Calendar Integration** - אינטגרציה עם Google Calendar
- ✅ **Rating System** - מערכת דירוגים ומשוב

---

## 🏗️ ארכיטקטורה

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Smart Intake  │  │ International   │  │   Dashboard  │ │
│  │     Portal      │  │     Court       │  │   & Cases    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   AI Chat       │  │   Voice Input   │  │   Calendar   │ │
│  │   Components    │  │   & Recording   │  │  Integration │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend Cloud                     │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   PostgreSQL    │  │   Supabase      │  │    Edge      │ │
│  │    Database     │  │     Auth        │  │  Functions   │ │
│  │   (25 Tables)   │  │   (JWT/RLS)     │  │ (13 Functions)│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   API Gateway   │  │   Real-time     │  │   Storage    │ │
│  │   & Webhooks    │  │   Subscriptions │  │   Buckets    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Integrations                     │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     OpenAI      │  │   WhatsApp      │  │    Stripe    │ │
│  │   (GPT Models   │  │ Business API    │  │   Payments   │ │
│  │   & Whisper)    │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Google Calendar │  │    HubSpot      │  │   Calendly   │ │
│  │   Integration   │  │      CRM        │  │  Scheduling  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 סטק טכנולוגי

### Frontend Stack
```json
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.5.3",
  "bundler": "Vite 5.4.2",
  "routing": "React Router DOM 6.26.2",
  "styling": "TailwindCSS 3.4.10",
  "state_management": "TanStack Query 5.56.2",
  "forms": "React Hook Form 7.53.0",
  "ui_components": "Radix UI + Shadcn/ui",
  "themes": "Next Themes 0.3.0"
}
```

### Backend Stack
```json
{
  "platform": "Supabase Cloud",
  "database": "PostgreSQL 15",
  "auth": "Supabase Auth (JWT + RLS)",
  "api": "Supabase REST API + GraphQL",
  "realtime": "Supabase Realtime",
  "storage": "Supabase Storage",
  "edge_functions": "Deno Runtime",
  "webhooks": "Supabase Webhooks"
}
```

### External Services
```json
{
  "ai_models": "OpenAI (GPT-4o-mini, Whisper)",
  "messaging": "WhatsApp Business API",
  "payments": "Stripe",
  "calendar": "Google Calendar API",
  "crm": "HubSpot API",
  "scheduling": "Calendly API",
  "hosting": "Netlify",
  "monitoring": "Sentry"
}
```

---

## 🚀 הקמת סביבת פיתוח

### דרישות מקדימות
```bash
# Node.js גרסה 18 ומעלה
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# או Bun (מומלץ)
curl -fsSL https://bun.sh/install | bash
```

### 1. שכפול הפרויקט
```bash
git clone [repository-url]
cd lawyer-opportunity-hub
```

### 2. התקנת dependencies
```bash
# עם npm
npm install

# או עם bun (מומלץ)
bun install
```

### 3. הגדרת Environment Variables
```bash
# העתקת קובץ הדוגמה
cp .env.example .env.local

# עריכת הקובץ עם המפתחות הנכונים
nano .env.local
```

#### משתני סביבה נדרשים:
```env
# Supabase Configuration
SUPABASE_URL=https://mlnwpocuvjnelttvscja.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# External APIs (Optional for development)
VITE_OPENAI_API_KEY=sk-...
VITE_SENTRY_DSN=https://...
```

### 4. הרצת שרת הפיתוח
```bash
# עם npm
npm run dev

# עם bun
bun dev

# האתר יהיה זמין ב: http://localhost:5173
```

### 5. בדיקת הקמה
```bash
# הרצת בדיקות
npm run test

# בדיקת linting
npm run lint

# בניית production
npm run build
```

---

## 📁 מבנה הפרויקט

```
src/
├── components/           # רכיבי UI כלליים
│   ├── ui/              # רכיבי UI בסיסיים (shadcn)
│   ├── auth/            # רכיבי אימות
│   ├── court/           # רכיבים לבית המשפט הדיגיטלי
│   ├── polls/           # מערכת סקרים
│   ├── professionals/   # מקצועיים וספקים
│   ├── social/          # תכונות חברתיות
│   └── subscription/    # ניהול מנויים
│
├── pages/               # דפי האפליקציה
│   ├── Auth.tsx         # דף התחברות
│   ├── Dashboard.tsx    # לוח בקרה ראשי
│   ├── Cases.tsx        # ניהול תיקים
│   ├── Intake.tsx       # קליטת לקוחות
│   ├── GlobalCourt.tsx  # בית משפט בינלאומי
│   └── court/           # דפי בית משפט
│
├── aiIntake/            # מערכת AI לקליטת מידע
│   ├── AIBridge.tsx     # גשר בין AI לטפסים
│   ├── EnhancedAIParser.ts  # פרסר AI מתקדם
│   ├── SmartConversationEngine.ts  # מנוע שיח חכם
│   └── useFormWithAI.ts # hook לטפסים עם AI
│
├── features/            # תכונות מתקדמות
│   └── ai/              # פורטלי AI
│
├── hooks/               # React hooks מותאמים
│   ├── useAuth.tsx      # אימות משתמשים
│   ├── useCases.ts      # ניהול תיקים
│   ├── useClients.ts    # ניהול לקוחות
│   └── useFieldExtraction.ts  # חילוץ שדות AI
│
├── integrations/        # אינטגרציות חיצוניות
│   ├── supabase/        # קליינט Supabase
│   ├── calendly.ts      # Calendly API
│   └── googleCalendar.ts # Google Calendar
│
├── lib/                 # ספריות עזר
│   ├── utils.ts         # פונקציות עזר כלליות
│   ├── aiService.ts     # שירותי AI
│   └── whatsappService.ts # שירות WhatsApp
│
└── services/            # שירותים עסקיים
    ├── evidence.ts      # ניהול ראיות
    └── gptClient.ts     # קליינט GPT
```

### קבצי תצורה חשובים:
```
├── tailwind.config.ts   # תצורת TailwindCSS
├── index.css           # משתני עיצוב גלובליים
├── vite.config.ts      # תצורת Vite
├── supabase/
│   ├── config.toml     # תצורת Supabase
│   └── functions/      # Edge Functions
└── public/
    └── _redirects      # תצורת redirects לNetlify
```

---

## 🗄️ בסיס הנתונים

### מבנה הטבלאות העיקריות (25 טבלאות)

#### טבלאות משתמשים ואימות:
```sql
-- פרופילי משתמשים
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'customer',
  avatar_url TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- תפקידי משתמש
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- עורכי דין
CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles NOT NULL,
  years_experience INTEGER,
  hourly_rate NUMERIC,
  rating NUMERIC DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  specializations TEXT[] DEFAULT '{}',
  law_firm TEXT,
  bio TEXT,
  location TEXT,
  availability_status TEXT DEFAULT 'available',
  verification_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### טבלאות עסקיות:
```sql
-- לידים
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  case_description TEXT NOT NULL,
  legal_category TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'medium',
  preferred_location TEXT,
  estimated_budget NUMERIC,
  case_details JSONB DEFAULT '{}',
  assigned_lawyer_id UUID REFERENCES lawyers,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'website',
  visibility_level TEXT DEFAULT 'restricted',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- תיקים
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES profiles,
  assigned_lawyer_id UUID REFERENCES lawyers,
  legal_category TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  estimated_budget NUMERIC,
  notes TEXT,
  opened_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ציטוטי מחיר
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads NOT NULL,
  lawyer_id UUID REFERENCES lawyers NOT NULL,
  quote_amount NUMERIC NOT NULL,
  service_description TEXT NOT NULL,
  estimated_duration_days INTEGER,
  payment_terms TEXT,
  terms_and_conditions TEXT,
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### טבלאות AI ומתקדמות:
```sql
-- טיוטות תיקים עם AI
CREATE TABLE case_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  description TEXT,
  legal_category TEXT,
  jurisdiction TEXT,
  location TEXT,
  claim_amount NUMERIC,
  parties JSONB DEFAULT '[]',
  evidence JSONB DEFAULT '[]',
  extracted_fields JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  readiness_score INTEGER DEFAULT 0,
  version_hash TEXT,
  status TEXT DEFAULT 'draft',
  is_simulation BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- לוגי חילוץ AI
CREATE TABLE ai_extraction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  case_draft_id UUID REFERENCES case_drafts,
  input_text TEXT NOT NULL,
  extracted_fields JSONB,
  confidence_score NUMERIC,
  processing_time_ms INTEGER,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- תמלול קולי
CREATE TABLE voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  case_draft_id UUID REFERENCES case_drafts,
  transcription_text TEXT NOT NULL,
  language_detected TEXT DEFAULT 'he-IL',
  audio_duration_seconds INTEGER,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies (Row Level Security)

כל הטבלאות מוגנות ב-RLS policies:

```sql
-- דוגמה לטבלת profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (user_id = auth.uid());

-- דוגמה לטבלת cases
CREATE POLICY "Clients can view their own cases" 
ON cases FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) OR 
  assigned_lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
);
```

### פונקציות בסיס נתונים

```sql
-- קבלת תפקיד משתמש נוכחי
CREATE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM user_roles 
  WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- חישוב ציון התאמה לעורך דין
CREATE FUNCTION calculate_matching_score(
  p_lawyer_id UUID, 
  p_legal_category TEXT, 
  p_estimated_budget NUMERIC DEFAULT 0
)
RETURNS INTEGER AS $$
  -- לוגיקה מורכבת לחישוב ציון התאמה
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- עיבוד ליד נכנס מוואטסאפ
CREATE FUNCTION process_incoming_lead(
  p_from_number TEXT, 
  p_content TEXT
)
RETURNS UUID AS $$
  -- יצירת ליד חדש ועיבוד התוכן
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚡ Edge Functions (13 פונקציות)

### פונקציות AI:
```typescript
// supabase/functions/ai-intake-openai/index.ts
// מטפלת בחילוץ מידע משפטי באמצעות OpenAI
serve(async (req) => {
  const { messages } = await req.json();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      // פרמטרים נוספים...
    }),
  });
  
  return new Response(JSON.stringify(data));
});
```

### פונקציות וואטסאפ:
```typescript
// supabase/functions/whatsapp-webhook/index.ts
// מטפלת בהודעות נכנסות מוואטסאפ
serve(async (req) => {
  const body = await req.json();
  
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0];
    
    // עיבוד ההודעה ויצירת ליד
    const leadId = await processIncomingLead(
      message.from, 
      message.text.body
    );
    
    // שליחת תגובה אוטומטית
    await sendWhatsAppResponse(message.from, leadId);
  }
  
  return new Response('OK');
});
```

### פונקציות תשלומים:
```typescript
// supabase/functions/stripe-webhook/index.ts
// מטפלת ב-webhooks של Stripe
serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body, 
    sig, 
    webhookSecret
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // עדכון סטטוס תשלום במסד הנתונים
      break;
    case 'payment_intent.payment_failed':
      // טיפול בכשל תשלום
      break;
  }
  
  return new Response('OK');
});
```

### רשימה מלאה של Edge Functions:

1. **ai-intake-openai** - חילוץ מידע משפטי עם OpenAI
2. **transcribe-voice** - תמלול קולי עם Whisper
3. **whatsapp-webhook** - קבלת הודעות וואטסאפ
4. **stripe-webhook** - טיפול בתשלומים
5. **google-calendar-sync** - סנכרון יומן
6. **openai-chat** - צ'אט כללי עם OpenAI
7. **ai-court-orchestrator** - תזמור בית משפט AI
8. **court-document-upload** - העלאת מסמכים משפטיים
9. **evidence-search** - חיפוש ראיות
10. **case-export** - ייצוא תיקים
11. **court-reminder** - תזכורות בית משפט
12. **get-professionals** - קבלת רשימת מקצועיים
13. **hearings** - ניהול דיונים

---

## 🔐 אבטחה

### Supabase Auth + RLS
- **JWT Tokens** - אימות מבוסס JSON Web Tokens
- **Row Level Security** - הגנה ברמת השורה בכל טבלה
- **Role-based Access** - בקרת גישה מבוססת תפקידים

### API Keys Management
```typescript
// כל המפתחות מאוחסנים ב-Supabase Secrets
const secrets = {
  OPENAI_API_KEY: 'OpenAI API key',
  WHATSAPP_TOKEN: 'WhatsApp Business API token',
  WHATSAPP_PHONE_ID: 'WhatsApp phone number ID',
  GOOGLE_API_KEY: 'Google Calendar API key',
  HUGGINGFACE_API_KEY: 'HuggingFace API key',
  MODEL_SERVER_URL: 'Custom model server URL'
};
```

### CORS Configuration
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Input Validation
- **Zod Schemas** - ולידציה של נתונים נכנסים
- **SQL Injection Protection** - הגנה מפני SQL injection
- **XSS Protection** - הגנה מפני Cross-Site Scripting

---

## 📊 API Documentation

### REST API Endpoints

#### Authentication
```http
POST /auth/signup
POST /auth/signin
POST /auth/signout
GET  /auth/user
```

#### Leads Management
```http
GET    /rest/v1/leads
POST   /rest/v1/leads
PUT    /rest/v1/leads/{id}
DELETE /rest/v1/leads/{id}
```

#### Cases Management
```http
GET    /rest/v1/cases
POST   /rest/v1/cases
PUT    /rest/v1/cases/{id}
DELETE /rest/v1/cases/{id}
```

#### AI Functions
```http
POST /functions/v1/ai-intake-openai
POST /functions/v1/transcribe-voice
POST /functions/v1/openai-chat
POST /functions/v1/ai-court-orchestrator
```

### GraphQL API
```graphql
# קבלת תיקים עם פרטי לקוח ועורך דין
query GetCasesWithDetails {
  cases {
    id
    title
    status
    client:profiles(id: $client_id) {
      full_name
      phone
    }
    lawyer:lawyers(id: $assigned_lawyer_id) {
      profile:profiles {
        full_name
      }
      hourly_rate
    }
  }
}
```

### Realtime Subscriptions
```typescript
// האזנה לשינויים בטבלת leads
const subscription = supabase
  .channel('leads-changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'leads' 
    }, 
    (payload) => {
      console.log('Lead changed:', payload);
    }
  )
  .subscribe();
```

---

## 🚀 פריסה ו-CI/CD

### Frontend Deployment (Netlify)
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend Deployment (Supabase)
- **אוטומטי** - Edge Functions נפרסות אוטומטית
- **Environment Variables** - מוגדרות ב-Supabase Dashboard
- **Database Migrations** - רצות אוטומטית

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Environment Variables
```bash
# Production
SUPABASE_URL=https://mlnwpocuvjnelttvscja.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development  
VITE_OPENAI_API_KEY=sk-...
VITE_SENTRY_DSN=https://...
```

---

## 🔧 פתרון בעיות

### בעיות נפוצות

#### 1. שגיאות Edge Functions
```bash
# בדיקת לוגים
npx supabase functions logs ai-intake-openai

# בדיקה מקומית
npx supabase functions serve ai-intake-openai
```

#### 2. שגיאות RLS
```sql
-- בדיקת policy
SELECT * FROM pg_policies WHERE tablename = 'leads';

-- הפעלת RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

#### 3. שגיאות CORS
```typescript
// וידוא שהוספת CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

#### 4. שגיאות אימות
```typescript
// בדיקת JWT token
const token = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
```

### כלי דיבוג

#### Frontend
```typescript
// React DevTools
// TanStack Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Console logging
console.log('Debug info:', { user, session, data });
```

#### Backend
```typescript
// Edge Function logging
console.log('Function called with:', req.method, req.url);
console.error('Error occurred:', error);

// Supabase logging
const { data, error } = await supabase
  .from('table')
  .select()
  .eq('id', id);
  
if (error) console.error('Supabase error:', error);
```

### Performance Monitoring
```typescript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 📈 אנליטיקה ומעקב

### Supabase Analytics
- **Database Performance** - ביצועי בסיס נתונים
- **API Usage** - שימוש ב-API
- **Edge Function Logs** - לוגי פונקציות
- **Auth Events** - אירועי אימות

### Custom Analytics
```typescript
// מעקב אחר אירועים עסקיים
const trackEvent = async (event: string, data: any) => {
  await supabase.from('analytics_events').insert({
    event_name: event,
    event_data: data,
    user_id: user?.id,
    timestamp: new Date().toISOString()
  });
};
```

---

## 📚 משאבים נוספים

### תיעוד חיצוני
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### קהילה ותמיכה
- **Discord**: [Supabase Community](https://discord.supabase.com)
- **GitHub Issues**: [Project Repository](https://github.com/...)
- **Internal Slack**: #dev-team

### Code Style Guidelines
```typescript
// TypeScript interfaces
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'lawyer' | 'admin';
}

// React components
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState<Type>(initialValue);
  const { data, error } = useQuery(['key'], fetchFn);
  
  // Early returns
  if (error) return <ErrorComponent />;
  if (!data) return <LoadingComponent />;
  
  // JSX
  return (
    <div className="container mx-auto p-4">
      {/* Content */}
    </div>
  );
};
```

---

## 🎯 מטרות פיתוח עתידיות

### שלב הבא (Q1 2025)
- [ ] **Mobile App** - אפליקציה ליוזר ו-Android
- [ ] **Advanced AI** - שיפור יכולות AI והוספת מודלים
- [ ] **Integration Hub** - מרכז אינטגרציות נוסף
- [ ] **Analytics Dashboard** - לוח בקרה מתקדם

### שלב ארוך טווח (Q2-Q3 2025)
- [ ] **International Expansion** - הרחבה לשווקים נוספים
- [ ] **Blockchain Integration** - חוזים חכמים
- [ ] **AI Court System** - בית משפט AI מלא
- [ ] **White Label Solution** - פתרון למשרדי עורכי דין

---

**📞 יצירת קשר לתמיכה טכנית:**
- **Lead Developer**: [contact@example.com]
- **DevOps**: [devops@example.com]
- **Emergency**: [emergency@example.com]

---

*מסמך זה מתעדכן באופן שוטף. גרסה אחרונה: דצמבר 2024*