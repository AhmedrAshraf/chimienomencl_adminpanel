export type Quiz = {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  quiz_id: string
  text: string
  created_at: string
  updated_at: string
}

export type Option = {
  id: string
  question_id: string
  text: string
  is_correct: boolean
  created_at: string
  updated_at: string
}

export type QuizWithQuestions = Quiz & {
  questions: (Question & {
    options: Option[]
  })[]
} 