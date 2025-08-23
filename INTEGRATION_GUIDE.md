# 🔗 FORQ Service Integration Guide

## 🎯 **All Services Now Connected!**

Your FORQ app now has complete integration between all major services. Here's how everything works together:

---

## 🔧 **Connected Services**

### ✅ **1. Supabase Database & Authentication**
- **Database**: Restaurant data, user profiles, quiz responses
- **Auth**: User registration, login, profile management
- **Tables**: `users`, `restaurants`, `dishes`, `reviews`
- **Real-time**: Live data updates and user sessions

### ✅ **2. PostHog Analytics**
- **Client-side**: User behavior tracking, page views, interactions
- **Server-side**: API usage, performance metrics
- **Events**: Signup, signin, quiz completion, restaurant searches
- **User identification**: Tracks both authenticated and anonymous users

### ✅ **3. OpenAI GPT-4 Integration**
- **Chat**: Conversational AI for food recommendations
- **Intent extraction**: Understanding user requests
- **Personalization**: AI-powered restaurant suggestions
- **Content generation**: Dynamic food descriptions and recommendations

### ✅ **4. User Management System**
- **Authenticated users**: Full profile with preferences and history
- **Anonymous users**: Local storage with generated IDs
- **Quiz responses**: Saved to profile or localStorage
- **Seamless experience**: Works for both user types

---

## 🚀 **How It All Works Together**

### **User Journey Flow:**

1. **Landing Page** → User arrives at FORQ
2. **Quiz** → Captures food preferences (saves to profile/localStorage)
3. **Authentication** → Optional signup/signin (PostHog tracks events)
4. **Discover** → AI-powered restaurant recommendations using:
   - User preferences from quiz
   - OpenAI for personalization
   - Supabase for restaurant data
   - PostHog for behavior tracking

### **Data Flow:**

```
User Input → Quiz Responses → User Profile/localStorage
     ↓
OpenAI Analysis → Personalized Context → Restaurant Search
     ↓
Supabase Query → Filtered Results → UI Display
     ↓
PostHog Tracking → Analytics Dashboard
```

---

## 🔑 **Key Integration Points**

### **AuthContext (`/src/contexts/AuthContext.tsx`)**
- Global authentication state management
- Handles signup, signin, signout
- Manages user profiles and preferences
- Integrates with PostHog for user identification

### **Analytics Integration (`/src/lib/analytics.ts`)**
- PostHog client and server-side tracking
- Event tracking across all user actions
- User identification for both auth states
- Performance and usage analytics

### **OpenAI Integration (`/src/lib/openai.ts`)**
- GPT-4 chat functionality with FORQ system prompt
- Restaurant recommendation generation
- User intent extraction from natural language
- Personalized food suggestions

### **Database Integration (`/src/lib/auth.ts`)**
- Supabase client configuration
- User profile management
- Quiz response persistence
- Anonymous user ID generation

---

## 📊 **Real-time Data Flow**

### **Quiz Completion:**
1. User completes quiz → `AuthContext.saveQuizResponses()`
2. If authenticated → Save to Supabase user profile
3. If anonymous → Save to localStorage with generated ID
4. PostHog tracks completion event with user context

### **Restaurant Discovery:**
1. User visits discover page → Load user preferences
2. Generate context with OpenAI analysis
3. Query Supabase with personalized filters
4. Display results with real-time analytics tracking

### **Chat Interactions:**
1. User sends message → OpenAI processes with FORQ prompt
2. Extract intent and entities
3. Generate personalized response
4. Track conversation analytics

---

## 🛠 **Environment Variables Connected**

All your `.env.local` variables are now actively used:

```env
# Supabase - Database & Auth ✅
NEXT_PUBLIC_SUPABASE_URL=https://evbnltaknjrsuqddwaan.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostHog - Analytics ✅
NEXT_PUBLIC_POSTHOG_KEY=phc_2OM31R9njriEFmfY3WVH6DSQysO9rtivoUP6ixGw8yE
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_KEY=phc_2OM31R9njriEFmfY3WVH6DSQysO9rtivoUP6ixGw8yE
POSTHOG_HOST=https://app.posthog.com

# OpenAI - AI Chat & Recommendations ✅
OPENAI_API_KEY=sk-proj-feZhI4JPm0Gxl4IggKwlYUwfdotqrIxbN9S6a2za6P...
```

---

## 🎮 **Testing the Integration**

### **1. User Authentication Flow:**
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Check PostHog for signup_completed event
```

### **2. Quiz Integration:**
- Complete quiz → Check Supabase `users` table for saved preferences
- Verify PostHog `quiz_completed` event
- Test both authenticated and anonymous flows

### **3. Restaurant Discovery:**
- Visit `/discover` → Verify personalized results
- Check PostHog `restaurants_search` events
- Confirm OpenAI context generation

### **4. Analytics Verification:**
- PostHog dashboard: https://app.posthog.com
- Check user identification and event tracking
- Verify both client and server-side events

---

## 🔄 **Continuous Data Sync**

### **User Profile Sync:**
- Quiz responses automatically sync to user profile
- Anonymous users seamlessly upgrade to authenticated
- Preferences persist across sessions

### **Analytics Sync:**
- Real-time event tracking to PostHog
- User journey mapping across all touchpoints
- Performance monitoring and error tracking

### **AI Context Sync:**
- User preferences inform OpenAI recommendations
- Chat history influences future suggestions
- Behavioral data improves personalization

---

## 🎯 **Next Steps**

Your FORQ app now has enterprise-level integration! All services are connected and working together to provide:

- **Personalized Experience**: AI-driven recommendations based on user preferences
- **Seamless Authentication**: Works for both authenticated and anonymous users  
- **Comprehensive Analytics**: Full user journey tracking and insights
- **Real-time Data**: Live updates and synchronized user state
- **Scalable Architecture**: Ready for production deployment

The integration is complete and ready for users! 🚀
