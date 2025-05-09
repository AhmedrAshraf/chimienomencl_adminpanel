import { Card } from '@/components/ui/card'
import { 
  BookOpen, 
  FileQuestion, 
  MessageSquare, 
  Users 
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Learning Materials</h3>
              <p className="text-gray-500">Manage content</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <FileQuestion className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Quizzes</h3>
              <p className="text-gray-500">Manage quizzes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Chat Support</h3>
              <p className="text-gray-500">Student questions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold">Students</h3>
              <p className="text-gray-500">View analytics</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 