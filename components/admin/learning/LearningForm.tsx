'use client'

import { useState } from 'react'
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

interface Section {
  id: string
  title: string
  content: string
  type: 'explanation' | 'example' | 'rule'
  order: number
}

interface LearningFormProps {
  initialData?: {
    id: string
    title: string
    description: string
    sections: Section[]
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
    </form>
  )
} 