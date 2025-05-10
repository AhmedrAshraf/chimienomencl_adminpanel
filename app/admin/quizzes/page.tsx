'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { quizService } from '@/lib/services/quizService'
import { Quiz } from '@/types/database'
import { toast } from 'sonner'

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const data = await quizService.getQuizzes()
      setQuizzes(data)
    } catch (error) {
      console.log('Error loading quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      await quizService.deleteQuiz(id)
      toast.success('Quiz deleted successfully')
      loadQuizzes()
    } catch (error) {
      console.log('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Link href="/admin/quizzes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{quiz.title}</h3>
                <p className="text-gray-500 mt-1">{quiz.description}</p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/admin/quizzes/${quiz.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDelete(quiz.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 