'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { quizService } from '@/lib/services/quizService'
import { QuizWithQuestions } from '@/types/database'
import { toast } from 'sonner'

export default function QuizView() {
  const params = useParams()
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = async () => {
    try {
      const data = await quizService.getQuiz(params.id as string)
      setQuiz(data)
    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-500 mt-2">{quiz.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Question {index + 1}
              </h3>
              <p className="text-gray-700">{question.text}</p>

              <div className="space-y-2">
                <h4 className="font-medium">Options:</h4>
                <ul className="space-y-2">
                  {question.options.map((option) => (
                    <li
                      key={option.id}
                      className={`p-3 rounded-lg border ${
                        option.is_correct
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">{option.text}</span>
                        {option.is_correct && (
                          <span className="text-green-600 text-sm font-medium">
                            (Correct Answer)
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 