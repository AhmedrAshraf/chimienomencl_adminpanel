import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default function QuizManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Add your quizzes list here */}
          <p className="text-gray-500">No quizzes created yet.</p>
        </div>
      </Card>
    </div>
  )
} 