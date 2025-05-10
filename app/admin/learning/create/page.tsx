'use client'

import { LearningForm } from '@/components/admin/learning/LearningForm'

export default function CreateLearning() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Learning Content</h1>
      <LearningForm />
    </div>
  )
} 