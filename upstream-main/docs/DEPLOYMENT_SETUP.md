# 🚀 הגדרת פריסה אוטומטית עם GitHub Actions

## 📋 דרישות מוקדמות

1. **GitHub Repository** - הקוד צריך להיות ב-GitHub
2. **Netlify Account** - חשבון ב-Netlify
3. **Supabase Project** - פרויקט Supabase מוגדר

## 🔧 הגדרת Secrets ב-GitHub

עבור לעמוד ה-repository שלכם ב-GitHub ולחצו על:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

הוסיפו את ה-secrets הבאים:

### **1. Netlify Secrets**
```
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_SITE_ID=your_netlify_site_id
```

**איך לקבל את הערכים:**
- **NETLIFY_AUTH_TOKEN**: 
  1. לכו ל-Netlify → User settings → Personal access tokens
  2. צרו token חדש עם הרשאות מלאות
  
- **NETLIFY_SITE_ID**:
  1. לכו לאתר שלכם ב-Netlify
  2. Site settings → General → Site details
  3. העתיקו את ה-Site ID

### **2. Supabase Secrets**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**איך לקבל את הערכים:**
1. לכו לפרויקט Supabase שלכם
2. Settings → API
3. העתיקו את Project URL ו-anon public key

### **3. AI Service Secret (אופציונלי)**
```
VITE_HUGGING_FACE_TOKEN=hf_your_token_here
```

## 🔄 איך זה עובד

### **Push ל-main/master:**
1. GitHub Actions מריץ build
2. בודק linting ו-tests
3. מפרסם ישירות לייצור ב-Netlify
4. האתר מתעדכן אוטומטית

### **Pull Request:**
1. יוצר preview deployment
2. מוסיף קישור ל-PR
3. מאפשר לבדוק שינויים לפני merge

## 📁 מבנה הקבצים

```
.github/
└── workflows/
    ├── deploy.yml        # פריסה לייצור
    └── pr-preview.yml    # preview ל-PRs
```

## 🛠️ התאמות אישיות

### **שינוי branch לפריסה:**
```yaml
on:
  push:
    branches: [ main, develop ]  # הוסיפו branches נוספים
```

### **הוספת tests:**
```yaml
- name: Run tests
  run: npm test
```

### **הוספת type checking:**
```yaml
- name: Type check
  run: npm run type-check
```

## 🔍 מעקב ובדיקה

### **לוגים:**
- לכו ל-GitHub → Actions tab
- לחצו על הרצה ספציפית לראות לוגים

### **סטטוס פריסה:**
- GitHub יציג סטטוס ליד כל commit
- ✅ = פריסה הצליחה
- ❌ = פריסה נכשלה

### **Netlify Dashboard:**
- כל פריסה תופיע ב-Netlify dashboard
- תוכלו לראות היסטוריה ולחזור לגרסאות קודמות

## 🚨 פתרון בעיות נפוצות

### **Build נכשל:**
1. בדקו שכל ה-secrets מוגדרים נכון
2. ודאו שה-package.json תקין
3. בדקו את הלוגים ב-GitHub Actions

### **Netlify deployment נכשל:**
1. ודאו שה-NETLIFY_SITE_ID נכון
2. בדקו שה-NETLIFY_AUTH_TOKEN תקף
3. ודאו שיש הרשאות לאתר

### **Environment variables חסרים:**
1. ודאו שכל ה-VITE_ secrets מוגדרים
2. בדקו שהשמות זהים בדיוק
3. אל תשכחו את הקידומת VITE_

## 📞 תמיכה

אם יש בעיות:
1. בדקו את הלוגים ב-GitHub Actions
2. ודאו שכל ה-secrets מוגדרים
3. בדקו שה-netlify.toml תואם להגדרות

---

**🎉 אחרי ההגדרה, כל push ל-main יפרסם אוטומטית את האתר!**