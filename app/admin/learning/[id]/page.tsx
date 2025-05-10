'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { learningService } from '@/lib/services/learningService'
import { LearningWithSections } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Quiz {
  id: string
  title: string
  description: string
}

export default function ViewLearning() {
  const params = useParams()
  const [learning, setLearning] = useState<LearningWithSections | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')

  useEffect(() => {
    loadLearning()
  }, [])

  const loadLearning = async () => {
    try {
      const data = await learningService.getLearning(params.id as string)
      setLearning(data)
      const quizzes = await learningService.getAvailableQuizzes(params.id as string)
      setAvailableQuizzes(quizzes)
    } catch (error) {
      console.error('Error loading learning:', error)
      toast.error('Failed to load learning content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkQuiz = async () => {
    if (!selectedQuizId) return

    try {
      await learningService.linkQuiz(params.id as string, selectedQuizId)
      toast.success('Quiz linked successfully!')
      setSelectedQuizId('')
      loadLearning()
    } catch (error) {
      console.error('Error linking quiz:', error)
      toast.error('Failed to link quiz')
    }
  }

  const handleUnlinkQuiz = async (quizId: string) => {
    try {
      await learningService.unlinkQuiz(params.id as string, quizId)
      toast.success('Quiz unlinked successfully!')
      loadLearning()
    } catch (error) {
      console.error('Error unlinking quiz:', error)
      toast.error('Failed to unlink quiz')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!learning) {
    return <div>Learning content not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{learning.title}</h1>
          <p className="text-gray-500 mt-2">{learning.description}</p>
        </div>
        <Link href={`/admin/learning/${learning.id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {learning.sections.map((section, index) => (
          <Card key={section.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 mt-2">
                  {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                </span>
              </div>
              <div className="prose max-w-none">
                {section.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Related Quizzes</h2>
          <div className="flex items-center space-x-2">
            <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a quiz to link" />
              </SelectTrigger>
              <SelectContent>
                {availableQuizzes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleLinkQuiz} disabled={!selectedQuizId}>
              <Plus className="mr-2 h-4 w-4" />
              Link Quiz
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {learning.quizzes.map((quizLink) => (
            <Card key={quizLink.id} className="p-4">
              <div className="flex justify-between items-center">
                <Link
                  href={`/admin/quizzes/${quizLink.quiz_id}`}
                  className="block flex-1"
                >
                  <h3 className="font-medium">{quizLink.quizzes.title}</h3>
                  <p className="text-sm text-gray-500">
                    {quizLink.quizzes.description}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUnlinkQuiz(quizLink.quiz_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 