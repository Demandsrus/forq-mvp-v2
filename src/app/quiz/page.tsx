'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'

type QuizResponse = {
  cuisinePreferences: string[]
  dietaryRestrictions: string[]
  spiceLevel: string
  cookingSkill: string
  mealTypes: string[]
}

const questions = [
  {
    id: 'cuisinePreferences',
    title: 'What cuisines do you enjoy?',
    type: 'multiple',
    options: ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'French', 'Thai']
  },
  {
    id: 'dietaryRestrictions',
    title: 'Any dietary restrictions?',
    type: 'multiple',
    options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'None']
  },
  {
    id: 'spiceLevel',
    title: 'How spicy do you like your food?',
    type: 'single',
    options: ['Mild', 'Medium', 'Hot', 'Extra Hot']
  },
  {
    id: 'cookingSkill',
    title: 'What\'s your cooking skill level?',
    type: 'single',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Professional']
  },
  {
    id: 'mealTypes',
    title: 'What meals are you most interested in?',
    type: 'multiple',
    options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages']
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
        router.push('/results')
      } else {
        throw new Error('Failed to save quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      // For now, still redirect to results
      router.push('/results')
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
          <h1 className="text-3xl font-bold">{question.title}</h1>
          
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.type === 'multiple' 
                ? Array.isArray(currentAnswer) && currentAnswer.includes(option)
                : currentAnswer === option

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (question.type === 'multiple') {
                      const current = (currentAnswer as string[]) || []
                      const updated = current.includes(option)
                        ? current.filter(item => item !== option)
                        : [...current, option]
                      handleAnswer(question.id, updated)
                    } else {
                      handleAnswer(question.id, option)
                    }
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    isSelected 
                      ? 'border-white bg-white text-black' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!isAnswered || isSubmitting}
            className="px-6 py-3 rounded-lg bg-white text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
