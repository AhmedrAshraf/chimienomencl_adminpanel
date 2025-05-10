'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { learningService } from '@/lib/services/learningService'
import { Learning } from '@/types/database'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LearningList() {
  const router = useRouter()
  const [learnings, setLearnings] = useState<Learning[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLearnings()
  }, [])

  const loadLearnings = async () => {
    try {
      const data = await learningService.getLearnings()
      setLearnings(data)
    } catch (error) {
      console.error('Error loading learnings:', error)
      toast.error('Failed to load learning content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning content?')) {
      return
    }

    try {
      await learningService.deleteLearning(id)
      toast.success('Learning content deleted successfully!')
      loadLearnings()
    } catch (error) {
      console.error('Error deleting learning:', error)
      toast.error('Failed to delete learning content')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Learning Content</h1>
        <Button onClick={() => router.push('/admin/learning/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      <div className="grid gap-4">
        {learnings.map((learning) => (
          <Card key={learning.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{learning.title}</h2>
                <p className="text-gray-500 mt-1">{learning.description}</p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/admin/learning/${learning.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/learning/${learning.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(learning.id)}
                  className="text-red-600 hover:text-red-700"
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