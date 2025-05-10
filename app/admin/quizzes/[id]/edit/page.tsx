'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, X } from 'lucide-react'
import { quizService } from '@/lib/services/quizService'
import { QuizWithQuestions } from '@/types/database'
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

export default function EditQuiz() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [deletedQuestions, setDeletedQuestions] = useState<string[]>([])
  const [deletedOptions, setDeletedOptions] = useState<string[]>([])

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = async () => {
    try {
      const quiz = await quizService.getQuiz(params.id as string)
      setTitle(quiz.title)
      setDescription(quiz.description || '')
      setQuestions(
        quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.is_correct,
          })),
        }))
      )
    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `new-${crypto.randomUUID()}`,
      text: '',
      options: [
        { id: `new-${crypto.randomUUID()}`, text: '', isCorrect: false },
        { id: `new-${crypto.randomUUID()}`, text: '', isCorrect: false },
      ],
    }
    setQuestions([newQuestion, ...questions])
  }

  const removeQuestion = (questionId: string) => {
    if (!questionId.startsWith('new-')) {
      setDeletedQuestions([...deletedQuestions, questionId])
    }
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, text } : q))
    )
  }

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text } : opt
              ),
            }
          : q
      )
    )
  }

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === optionId,
              })),
            }
          : q
      )
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: `new-${crypto.randomUUID()}`, text: '', isCorrect: false },
              ],
            }
          : q
      )
    )
  }

  const removeOption = (questionId: string, optionId: string) => {
    if (!optionId.startsWith('new-')) {
      setDeletedOptions([...deletedOptions, optionId])
    }
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((opt) => opt.id !== optionId),
            }
          : q
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update the quiz
      await quizService.updateQuiz(params.id as string, {
        title,
        description,
      })

      // Delete removed questions and their options
      for (const questionId of deletedQuestions) {
        await quizService.deleteQuestion(questionId)
      }

      // Delete removed options
      for (const optionId of deletedOptions) {
        await quizService.deleteOption(optionId)
      }

      // Update questions and options
      for (const question of questions) {
        if (question.id.startsWith('new-')) {
          // Create new question
          const createdQuestion = await quizService.createQuestion({
            quiz_id: params.id as string,
            text: question.text,
          })

          const options = question.options.map((option) => ({
            question_id: createdQuestion.id,
            text: option.text,
            is_correct: option.isCorrect,
          }))

          await quizService.createOptions(options)
        } else {
          // Update existing question
          await quizService.updateQuestion(question.id, {
            text: question.text,
          })

          // Update options
          for (const option of question.options) {
            if (option.id.startsWith('new-')) {
              await quizService.createOptions([
                {
                  question_id: question.id,
                  text: option.text,
                  is_correct: option.isCorrect,
                },
              ])
            } else {
              await quizService.updateOption(option.id, {
                text: option.text,
                is_correct: option.isCorrect,
              })
            }
          }
        }
      }

      toast.success('Quiz updated successfully!')
      router.push('/admin/quizzes')
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error('Failed to update quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Quiz</h1>

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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Question {index + 1}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, e.target.value)}
                      placeholder="Enter your question"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 my-6">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Options</label>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => addOption(question.id)}
                      className="text-accent-foreground"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
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
                        onChange={(e) =>
                          updateOption(question.id, option.id, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                        className="flex-1"
                      />
                      {question.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(question.id, option.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
} 