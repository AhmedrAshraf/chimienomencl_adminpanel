'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, X } from 'lucide-react'
import { learningService } from '@/lib/services/learningService'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface Section {
  id: string
  title: string
  content: string
  type: 'explanation' | 'example' | 'rule'
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string
}

interface LearningFormProps {
  initialData?: {
    id: string
    title: string
    description: string
    sections: Section[]
    quizzes?: { quiz_id: string; quizzes: Quiz }[]
  }
}

export function LearningForm({ initialData }: LearningFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [sections, setSections] = useState<Section[]>(
    initialData?.sections || []
  )
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [linkedQuizzes, setLinkedQuizzes] = useState<{ quiz_id: string; quizzes: Quiz }[]>(
    initialData?.quizzes || []
  )

  useEffect(() => {
    loadAvailableQuizzes()
  }, [])

  const loadAvailableQuizzes = async () => {
    try {
      const quizzes = await learningService.getAvailableQuizzes(initialData?.id || '')
      setAvailableQuizzes(quizzes)
    } catch (error) {
      console.error('Error loading available quizzes:', error)
      toast.error('Failed to load available quizzes')
    }
  }

  const handleLinkQuiz = async () => {
    if (!selectedQuizId) return

    try {
      const learningId = initialData?.id
      if (learningId) {
        await learningService.linkQuiz(learningId, selectedQuizId)
        const quiz = availableQuizzes.find(q => q.id === selectedQuizId)
        if (quiz) {
          setLinkedQuizzes([...linkedQuizzes, { quiz_id: selectedQuizId, quizzes: quiz }])
        }
        toast.success('Quiz linked successfully!')
        setSelectedQuizId('')
        loadAvailableQuizzes()
      }
    } catch (error) {
      console.error('Error linking quiz:', error)
      toast.error('Failed to link quiz')
    }
  }

  const handleUnlinkQuiz = async (quizId: string) => {
    const learningId = initialData?.id
    if (!learningId) return

    try {
      await learningService.unlinkQuiz(learningId, quizId)
      setLinkedQuizzes(linkedQuizzes.filter(q => q.quiz_id !== quizId))
      toast.success('Quiz unlinked successfully!')
      loadAvailableQuizzes()
    } catch (error) {
      console.error('Error unlinking quiz:', error)
      toast.error('Failed to unlink quiz')
    }
  }

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      type: 'explanation',
      order: sections.length,
    }
    setSections([newSection, ...sections])
  }

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId))
  }

  const updateSection = (
    sectionId: string,
    field: keyof Omit<Section, 'id' | 'order'>,
    value: string
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!title.trim()) {
        throw new Error('Title is required')
      }
      if (!description.trim()) {
        throw new Error('Description is required')
      }
      if (sections.length === 0) {
        throw new Error('At least one section is required')
      }

      // Validate sections
      for (const section of sections) {
        if (!section.title.trim()) {
          throw new Error('Section title is required')
        }
        if (!section.content.trim()) {
          throw new Error('Section content is required')
        }
        if (!section.type) {
          throw new Error('Section type is required')
        }
      }

      let learningId: string

      if (initialData) {
        // Update existing learning
        await learningService.updateLearning(initialData.id, {
          title,
          description,
        })
        learningId = initialData.id

        // Update sections
        for (const section of sections) {
          try {
            if (section.id.startsWith('new-')) {
              await learningService.createSection({
                learning_id: learningId,
                title: section.title,
                content: section.content,
                type: section.type,
                order: section.order,
              })
            } else {
              await learningService.updateSection(section.id, {
                title: section.title,
                content: section.content,
                type: section.type,
                order: section.order,
              })
            }
          } catch (error) {
            console.error('Error saving section:', error)
            throw new Error(`Failed to save section "${section.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      } else {
        // Create new learning
        const learning = await learningService.createLearning({
          title,
          description,
        })
        learningId = learning.id

        // Create sections
        for (const section of sections) {
          try {
            await learningService.createSection({
              learning_id: learningId,
              title: section.title,
              content: section.content,
              type: section.type,
              order: section.order,
            })
          } catch (error) {
            console.error('Error creating section:', error)
            throw new Error(`Failed to create section "${section.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        // Link any selected quizzes
        for (const quiz of linkedQuizzes) {
          try {
            await learningService.linkQuiz(learningId, quiz.quiz_id)
          } catch (error) {
            console.error('Error linking quiz:', error)
            throw new Error(`Failed to link quiz "${quiz.quizzes.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }

      toast.success(
        initialData
          ? 'Learning content updated successfully!'
          : 'Learning content created successfully!'
      )
      router.push('/admin/learning')
    } catch (error) {
      console.error('Error saving learning content:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save learning content')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter learning content title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter learning content description"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sections</h2>
          <Button type="button" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>

        {sections.map((section, index) => (
          <Card key={section.id} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Section {index + 1}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, 'title', e.target.value)
                    }
                    placeholder="Enter section title"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(section.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={section.type}
                  onValueChange={(value) =>
                    updateSection(section.id, 'type', value as Section['type'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explanation">Explanation</SelectItem>
                    <SelectItem value="example">Example</SelectItem>
                    <SelectItem value="rule">Nomenclature Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={section.content}
                  onChange={(e) =>
                    updateSection(section.id, 'content', e.target.value)
                  }
                  placeholder="Enter section content"
                  required
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? 'Saving...'
              : 'Creating...'
            : initialData
            ? 'Save Changes'
            : 'Create Learning Content'}
        </Button>
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
            <Button 
              onClick={() => {
                const quiz = availableQuizzes.find(q => q.id === selectedQuizId)
                if (quiz) {
                  setLinkedQuizzes([...linkedQuizzes, { quiz_id: selectedQuizId, quizzes: quiz }])
                  setSelectedQuizId('')
                }
              }} 
              disabled={!selectedQuizId} 
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Link Quiz
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {linkedQuizzes.map((quizLink) => (
            <Card key={quizLink.quiz_id} className="p-4">
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
                  onClick={() => setLinkedQuizzes(linkedQuizzes.filter(q => q.quiz_id !== quizLink.quiz_id))}
                  className="text-red-600 hover:text-red-700"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </form>
  )
} 