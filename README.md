# FORQ MVP - AI Food Assistant

A Next.js 14 application featuring an AI-powered food assistant that provides personalized recipe recommendations and cooking guidance.

## 🚀 Features

- **Personalized Food Quiz** - Discover user preferences for cuisine, dietary restrictions, spice levels, and cooking skills
- **AI Recipe Recommendations** - Get tailored recipe suggestions based on quiz responses
- **AI Chat Assistant** - Interactive chat for cooking tips, recipe questions, and meal planning
- **User Authentication** - Secure sign-up/sign-in with Supabase
- **Favorites System** - Save and manage favorite recipes
- **Analytics Tracking** - User behavior insights with PostHog

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui components
- **Database & Auth**: Supabase
- **Analytics**: PostHog (client + server)
- **Testing**: Vitest + Testing Library
- **AI**: OpenAI GPT (ready for integration)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- PostHog account (optional)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd forq-mvp
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `NEXT_PUBLIC_POSTHOG_KEY` - Your PostHog project API key
   - `OPENAI_API_KEY` - Your OpenAI API key (for production chat)

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

## 📝 API Endpoints

### POST `/api/quiz/save`
Save user quiz responses

### GET `/api/recs`
Get personalized recipe recommendations

### POST `/api/chat`
Send message to AI assistant

### POST `/api/favorite`
Add/remove recipe from favorites

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
