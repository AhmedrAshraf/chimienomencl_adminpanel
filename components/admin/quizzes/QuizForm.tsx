'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { quizService } from '@/lib/services/quizService'
import { toast } from 'sonner'

interface Question {
  id: string
  text: string
  options: {
    id: string
    text: string
    isCorrect: boolean
  }[]
}

export function QuizForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    ))
  }

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        options: q.options.map(opt =>
          opt.id === optionId ? { ...opt, text } : opt
        )
      } : q
    ))
  }

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? {
        ...q,
        options: q.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === optionId
        }))
      } : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create the quiz
      const quiz = await quizService.createQuiz({
        title,
        description
      })

      // Create questions and options
      for (const question of questions) {
        const createdQuestion = await quizService.createQuestion({
          quiz_id: quiz.id,
          text: question.text
        })

        const options = question.options.map(option => ({
          question_id: createdQuestion.id,
          text: option.text,
          is_correct: option.isCorrect
        }))

        await quizService.createOptions(options)
      }

      toast.success('Quiz created successfully!')
      router.push('/admin/quizzes')
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error('Failed to create quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button type="button" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Question {index + 1}
                  </label>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, e.target.value)}
                    placeholder="Enter your question"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={option.isCorrect}
                      onChange={() => setCorrectOption(question.id, option.id)}
                      className="h-4 w-4"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Quiz'}
        </Button>
      </div>
    </form>
  )
} 