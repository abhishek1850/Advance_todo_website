# PRODUCTION DEPLOYMENT GUIDE

## Environment Variables - REQUIRED

Create a `.env.local` file in the root directory with these variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Service (Groq)
GROQ_API_KEY=your_groq_api_key

# Deployment
NODE_ENV=production
VITE_API_URL=https://yourdomain.com
```

**NEVER commit `.env.local` to git!** Add to `.gitignore`:
```
.env.local
.env.*.local
```

---

## Firebase Setup Checklist

### 1. Deploy Firestore Rules
```bash
firebase init firestore
firebase deploy --only firestore:rules
```

Verify rules are deployed:
- ✅ Users collection with userId matching check
- ✅ Journal entries with userId validation
- ✅ AI conversations with owner-only access
- ✅ Messages are immutable (no updates/deletes)

### 2. Deploy Firestore Indexes

Go to Firebase Console > Firestore > Indexes and create:

| Collection | Fields | Status |
|-----------|--------|--------|
| journal_entries | userId (Asc), date (Desc) | REQUIRED |
| ai_conversations | userId (Asc), lastMessageAt (Desc) | REQUIRED |
| ai_conversations/{id}/messages | createdAt (Asc) | OPTIONAL (can use default) |

Or use CLI:
```bash
firebase deploy --only firestore:indexes
```

### 3. Enable Required Firebase Services
- [x] Authentication (Email + Google OAuth)
- [x] Firestore Database
- [x] Cloud Storage (if needed for images)

### 4. Configure Firebase Auth
In Firebase Console > Authentication:
- Enable "Email/Password" provider
- Enable "Google" provider
- Set authorized redirect URIs
- Disable "Allow creation of new user accounts" if not self-signup

---

## Deployment to Vercel

### 1. Connect Repository
```bash
npm install -g vercel
vercel
```

### 2. Set Environment Variables
In Vercel Dashboard > Settings > Environment Variables:
```
GROQ_API_KEY=your_api_key
```

**Do NOT expose Firebase keys in Vercel env** - use `VITE_` prefix so they're public but safe.

### 3. Deploy
```bash
npm run build
vercel --prod
```

---

## Pre-Production Testing

### Security Checklist
- [ ] No console.error/log sensitive data in production
- [ ] All user inputs validated and sanitized
- [ ] Firestore rules prevent cross-user access
- [ ] API rate limiting working (10 req/min per user)
- [ ] No hardcoded API keys in client code
- [ ] HTTPS enforced everywhere

### Data Integrity
- [ ] Firestore as single source of truth
- [ ] localStorage only stores safe profile data
- [ ] Retry logic works on network failure
- [ ] Journal entries prevent duplicates (upsert pattern)
- [ ] AI conversations immutable after creation

### Performance Checks
- [ ] Build size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Firestore queries use indexes
- [ ] No N+1 query patterns
- [ ] Lazy loading of heavy components

### Functionality Testing
- [ ] User auth works (email & Google)
- [ ] Tasks create, update, delete properly
- [ ] Tasks persist after browser refresh
- [ ] Journal entries autosave
- [ ] AI chat responds within 30s
- [ ] Streak calculation correct
- [ ] XP gains accurate
- [ ] Notifications display
- [ ] Mobile responsive

---

## Monitoring & Alerts

### Set Up Firebase Monitoring
```bash
firebase init monitoring
firebase deploy --only functions
```

### Groq API Monitoring
- Monitor rate limit quotas
- Set up alerts for > 400 errors
- Track response times (should be < 10s)

### Log Aggregation
Use Vercel Analytics or Google Cloud Logging:
```bash
firebase functions:log --limit 100
```

---

## Scaling for 100+ Concurrent Users

### Database Optimization
- ✅ Indexes optimized
- ✅ Array limits set (150 tasks max)
- ✅ Journal limited to 60 entries per fetch
- ✅ Composite queries use indexes

### API Rate Limiting
- ✅ Client-side: 10 req/min per user
- ✅ Server-side: 10 req/min per user
- ✅ Message size limits (50KB each, 200KB total)

### Frontend Optimization
- ✅ Code splitting
- ✅ Lazy loading components
- ✅ Memoization for expensive calculations
- ✅ Debounce search/filters

### Server Scaling
- Vercel auto-scales API routes
- Firestore reads scale automatically
- No server-side database needed

---

## Troubleshooting

### "Firestore index not found" Error
**Fix:** Deploy indexes from Firebase Console > Indexes

### "Rate limit exceeded" from Groq
**Cause:** User exceeded 10 requests/min
**Fix:** Show user message to wait 60s, retry automatically

### "Operation not permitted" on Firestore
**Cause:** Security rules mismatch or missing userId
**Fix:** Check Firestore rules match pattern `/users/{uid}`

### Tasks disappear after refresh
**Cause:** localStorage overwriting Firestore
**Status:** ✅ FIXED - localStorage only stores profile

### Duplicate journal entries
**Cause:** Concurrent writes without upsert
**Status:** ✅ FIXED - Using `setDoc` with merge

---

## Security Incidents Response

### If API Key is Exposed
1. Immediately rotate API key in Firebase/Groq console
2. Redeploy with new key
3. Check logs for suspicious activity

### If User Data is Compromised
1. Force logout all users
2. Notify affected users
3. Review Firestore rules
4. Check audit logs

---

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Review Firestore usage | Weekly | DevOps |
| Check error logs | Daily | DevOps |
| Update dependencies | Monthly | Dev |
| Security audit | Quarterly | Security |
| Performance optimization | Quarterly | Dev |

---

## Build & Deploy Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy Firebase rules only
firebase deploy --only firestore:rules

# View Firestore logs
firebase functions:log
```

---

## Contact & Support

For issues:
1. Check logs: `firebase functions:log`
2. Check Firestore rules: Firebase Console > Firestore > Rules
3. Check rate limits: Vercel > Analytics
4. Review error boundary: Check ErrorBoundary component

