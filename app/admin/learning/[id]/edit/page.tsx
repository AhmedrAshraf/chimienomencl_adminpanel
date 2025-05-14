'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LearningForm } from '@/components/admin/learning/LearningForm'
import { learningService } from '@/lib/services/learningService'
import { LearningWithSections } from '@/types/database'
import { toast } from 'sonner'

export default function EditLearning() {
  const params = useParams()
  const [learning, setLearning] = useState<LearningWithSections | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLearning()
  }, [])

  const loadLearning = async () => {
    try {
      const data = await learningService.getLearning(params.id as string)
      setLearning(data)
    } catch (error) {
      console.error('Error loading learning:', error)
      toast.error('Failed to load learning content')
    } finally {
      setIsLoading(false)
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
      <h1 className="text-3xl font-bold">Edit Learning Content</h1>
      <LearningForm
        initialData={{
          id: learning.id,
          title: learning.title,
          description: learning.description ?? '',
          sections: learning.sections.map((section) => ({
            id: section.id,
            title: section.title,
            content: section.content,
            type: section.type as 'explanation' | 'example' | 'rule',
            order: section.order,
          })),
          quizzes: learning.quizzes.map(quiz => ({
            quiz_id: quiz.quiz_id,
            quizzes: quiz.quizzes
          })),
        }}
      />
    </div>
  )
} 