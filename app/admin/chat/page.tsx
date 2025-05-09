import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export default function ChatSupport() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat Support</h1>

      <Card className="p-6">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4">
            {/* Chat messages will go here */}
            <p className="text-gray-500">No messages yet.</p>
          </div>

          <div className="flex space-x-2">
            <Input 
              placeholder="Type your message..." 
              className="flex-1"
            />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 