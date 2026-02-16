# Firestore Indexes - MUST BE DEPLOYED

Deploy these indexes to Firebase Console > Firestore > Indexes

## Required Indexes (Composite)

### 1. Journal Entries Index
**Collection:** `journal_entries`
**Fields:**
- `userId` (Ascending)
- `date` (Descending)

**Reason:** Fetch journal entries for a user sorted by recent date (fetchJournalEntries query)

---

### 2. AI Conversations Index
**Collection:** `ai_conversations`
**Fields:**
- `userId` (Ascending)
- `lastMessageAt` (Descending)

**Reason:** List user's conversations sorted by most recent message first

---

### 3. AI Conversation Messages Index
**Collection:** `ai_conversations/{conversationId}/messages`
**Fields:**
- `createdAt` (Ascending)

**Reason:** Sort messages chronologically in a conversation

---

## Single Field Indexes (Auto-Created)
These are auto-created by Firebase when not indexed:
- `users.uid`
- `ai_conversations.userId`
- `journal_entries.userId`

---

## Deployment Steps

1. Go to Firebase Console
2. Select your project
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index**
5. Enter each index manually or import from this config

Alternatively, if using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

Ensure your `firebase.json` contains:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## Testing Indexes

After deployment (can take 1-2 minutes):

```typescript
// Test journal entries index
const q = query(
  collection(db, 'journal_entries'),
  where('userId', '==', user.uid),
  orderBy('date', 'desc')
);
const snap = await getDocs(q);
```

If the index is not yet deployed, you'll get an error message with a link to auto-deploy it.

