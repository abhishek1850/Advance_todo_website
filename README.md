# ⚡ Attackers Arena

> **Execute Without Excuses.**

The productivity battleground for disciplined Attackers who finish every mission on time.

📄 **[View Full Product Specification](./PRODUCT_SPEC.md)** — Detailed breakdown of all features, gamification mechanics, and future roadmap.
🤖 **[View AI System Prompt](./AI_SYSTEM_PROMPT.md)** — Comprehensive guide for AI behavior, coaching logic, and development roadmap.

## 🛡️ Features

- **Mission-Based Task Management** — Daily, Monthly, and Yearly horizons
- **AI Battle Coach** — Powered by Gemini, your personal strategist
- **Gamification Engine** — XP, Levels, Streaks, Badges, Daily Challenges
- **Analytics Dashboard** — Track your attack patterns and productivity scores
- **Premium Dark UI** — Glassmorphism, smooth animations, built for warriors

## 🚀 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Auth & Database:** Firebase (Auth + Firestore)
- **AI:** Google Gemini API
- **Animations:** Framer Motion
- **State:** Zustand with persistence
- **Charts:** Recharts

## ⚙️ Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## 🔒 Security

- All API keys stored in environment variables
- Firebase Auth with password strength enforcement
- Firestore Row-Level Security rules
- Content Security Policy headers
- Rate-limited AI requests
- Auto session timeout after 30 min

## 📱 Deploy

```bash
npm run build
```

---

**Built with rage. Shipped with discipline.** ⚡🛡️
