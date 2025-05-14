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

export type Learning = {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Section = {
  order: any
  id: string
  learning_id: string
  title: string
  content: string
  type: string
}

export type LearningWithSections = Learning & {
  sections: Section[]
  quizzes: LearningQuiz[]
  learning_quizzes: LearningQuiz[]
}

export type LearningSection = {
  id: string
}

export type LearningQuiz = {
  id: string
  learning_id: string
  quiz_id: string
  quizzes: {
    id: string
    title: string
    description: string
  }
}

export type LearningWithQuiz = Learning & {
  quiz: Quiz
}

export type LearningWithSectionsAndQuiz = LearningWithSections & {
  quiz: QuizWithQuestions
}