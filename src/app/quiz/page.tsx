'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'

type QuizResponse = {
  foodMood: string
  cuisineVibes: string[]
  spiceLevel: string
  budgetRange: string
  deliveryTimes: string[]
  dietaryNeeds: string[]
  foodiePersonality: string
}

const questions = [
  {
    id: 'foodMood',
    title: '🍕 What\'s your food mood right now?',
    subtitle: 'Let\'s find restaurants that match your vibe',
    type: 'single',
    options: [
      { value: 'comfort', label: '😌 Comfort & Cozy', desc: 'Mac & cheese, pizza, warm soups' },
      { value: 'adventure', label: '🌶️ Bold & Adventurous', desc: 'Spicy, exotic, new flavors' },
      { value: 'healthy', label: '🥗 Fresh & Healthy', desc: 'Salads, bowls, lean proteins' },
      { value: 'indulgent', label: '🍰 Rich & Indulgent', desc: 'Steaks, desserts, fancy dishes' }
    ]
  },
  {
    id: 'cuisineVibes',
    title: '🌍 Which food vibes call to you?',
    subtitle: 'Pick all that make your mouth water',
    type: 'multiple',
    options: [
      { value: 'italian', label: '🍝 Italian Magic', desc: 'Pasta, pizza, gelato' },
      { value: 'mexican', label: '🌮 Mexican Fiesta', desc: 'Tacos, burritos, guac' },
      { value: 'asian', label: '🍜 Asian Fusion', desc: 'Ramen, sushi, stir-fry' },
      { value: 'american', label: '🍔 Classic American', desc: 'Burgers, BBQ, wings' },
      { value: 'mediterranean', label: '🫒 Mediterranean', desc: 'Hummus, falafel, fresh' },
      { value: 'indian', label: '🍛 Indian Spice', desc: 'Curry, naan, tandoori' }
    ]
  },
  {
    id: 'spiceLevel',
    title: '🌶️ How do you handle the heat?',
    subtitle: 'Your spice tolerance helps us pick perfect dishes',
    type: 'single',
    options: [
      { value: 'mild', label: '😊 Keep it Mild', desc: 'I like flavor without the fire' },
      { value: 'medium', label: '🔥 Medium Heat', desc: 'Some spice adds excitement' },
      { value: 'hot', label: '🌶️ Bring the Heat', desc: 'I love a good spicy kick' },
      { value: 'extreme', label: '🔥🔥 Extreme Fire', desc: 'The spicier, the better!' }
    ]
  },
  {
    id: 'budgetRange',
    title: '💰 What\'s your food budget vibe?',
    subtitle: 'We\'ll find amazing options in your range',
    type: 'single',
    options: [
      { value: '$', label: '💵 Budget-Friendly', desc: '$5-15 per meal' },
      { value: '$$', label: '💰 Mid-Range', desc: '$15-30 per meal' },
      { value: '$$$', label: '💎 Premium', desc: '$30+ per meal' },
      { value: 'varies', label: '🎯 It Depends', desc: 'Varies by mood & occasion' }
    ]
  },
  {
    id: 'deliveryTimes',
    title: '⏰ When do you usually order?',
    subtitle: 'Help us suggest the best times and deals',
    type: 'multiple',
    options: [
      { value: 'breakfast', label: '🌅 Morning Fuel', desc: '6AM - 11AM' },
      { value: 'lunch', label: '☀️ Lunch Break', desc: '11AM - 3PM' },
      { value: 'dinner', label: '🌆 Dinner Time', desc: '5PM - 9PM' },
      { value: 'late_night', label: '🌙 Late Night', desc: '9PM - 2AM' }
    ]
  },
  {
    id: 'dietaryNeeds',
    title: '🥬 Any dietary preferences?',
    subtitle: 'We\'ll make sure every suggestion works for you',
    type: 'multiple',
    options: [
      { value: 'vegetarian', label: '🌱 Vegetarian', desc: 'No meat please' },
      { value: 'vegan', label: '🌿 Vegan', desc: 'Plant-based only' },
      { value: 'gluten_free', label: '🌾 Gluten-Free', desc: 'No gluten' },
      { value: 'keto', label: '🥑 Keto-Friendly', desc: 'Low carb, high fat' },
      { value: 'dairy_free', label: '🥛 Dairy-Free', desc: 'No dairy products' },
      { value: 'none', label: '✨ No Restrictions', desc: 'I eat everything!' }
    ]
  },
  {
    id: 'foodiePersonality',
    title: '🎭 What\'s your foodie personality?',
    subtitle: 'This helps us understand your restaurant style',
    type: 'single',
    options: [
      { value: 'explorer', label: '🗺️ The Explorer', desc: 'Always trying new places' },
      { value: 'loyalist', label: '❤️ The Loyalist', desc: 'Stick to favorite spots' },
      { value: 'trendsetter', label: '📱 The Trendsetter', desc: 'Love Instagram-worthy food' },
      { value: 'practical', label: '⚡ The Practical', desc: 'Quick, tasty, convenient' }
    ]
  }
]

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Partial<QuizResponse>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    analytics.page('Quiz')
    analytics.track('quiz_started')
  }, [])

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      submitQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const submitQuiz = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      })

      if (response.ok) {
        analytics.track('quiz_completed', { responses })
        router.push('/discover')
      } else {
        throw new Error('Failed to save quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      // For now, still redirect to discover
      router.push('/discover')
    } finally {
      setIsSubmitting(false)
    }
  }

  const question = questions[currentQuestion]
  const currentAnswer = responses[question.id as keyof QuizResponse]
  const isAnswered = currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{question.title}</h1>
            {question.subtitle && (
              <p className="text-gray-400 text-lg">{question.subtitle}</p>
            )}
          </div>

          <div className="space-y-4">
            {question.options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value
              const optionLabel = typeof option === 'string' ? option : option.label
              const optionDesc = typeof option === 'string' ? '' : option.desc

              const isSelected = question.type === 'multiple'
                ? Array.isArray(currentAnswer) && currentAnswer.includes(optionValue)
                : currentAnswer === optionValue

              return (
                <button
                  key={optionValue}
                  onClick={() => {
                    if (question.type === 'multiple') {
                      const current = (currentAnswer as string[]) || []
                      const updated = current.includes(optionValue)
                        ? current.filter(item => item !== optionValue)
                        : [...current, optionValue]
                      handleAnswer(question.id, updated)
                    } else {
                      handleAnswer(question.id, optionValue)
                    }
                  }}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-white bg-white text-black shadow-lg transform scale-[1.02]'
                      : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">{optionLabel}</div>
                    {optionDesc && (
                      <div className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                        {optionDesc}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-xl border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-400 hover:bg-gray-900/50 transition-all duration-200"
          >
            ← Previous
          </button>

          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">
              {currentQuestion + 1} of {questions.length}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
            </div>
          </div>

          <button
            onClick={nextQuestion}
            disabled={!isAnswered || isSubmitting}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </span>
            ) : currentQuestion === questions.length - 1 ? (
              '🎉 Get My Restaurants!'
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
