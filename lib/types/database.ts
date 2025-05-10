export interface Learning {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface LearningSection {
  id: string
  learning_id: string
  title: string
  content: string
  type: 'explanation' | 'example' | 'rule'
  order: number
  created_at: string
  updated_at: string
}

export interface LearningQuiz {
  id: string
  learning_id: string
  quiz_id: string
  created_at: string
  updated_at: string
  quizzes: {
    id: string
    title: string
    description: string
  }
}

export interface LearningWithSections extends Learning {
  sections: LearningSection[]
  quizzes: LearningQuiz[]
} 