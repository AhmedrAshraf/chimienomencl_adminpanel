'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  FileQuestion, 
  MessageSquare 
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Learning',
    href: '/admin/learning',
    icon: BookOpen
  },
  {
    title: 'Quizzes',
    href: '/admin/quizzes',
    icon: FileQuestion
  },
  {
    title: 'Chat Support',
    href: '/admin/chat',
    icon: MessageSquare
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav className="space-y-1 px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 