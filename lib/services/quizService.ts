import { supabase } from '@/lib/supabase'
import { Quiz, Question, Option, QuizWithQuestions } from '@/types/database'

export const quizService = {
  // Create a new quiz
  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all quizzes
  async getQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get a single quiz with its questions and options
  async getQuiz(id: string) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()

    if (quizError) throw quizError

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        options (*)
      `)
      .eq('quiz_id', id)

    if (questionsError) throw questionsError

    return {
      ...quiz,
      questions
    } as QuizWithQuestions
  },

  // Create a question
  async createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create multiple options
  async createOptions(options: Omit<Option, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('options')
      .insert(options)
      .select()

    if (error) throw error
    return data
  },

  // Delete a quiz
  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Update a quiz
  async updateQuiz(id: string, quiz: Partial<Omit<Quiz, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a question
  async updateQuestion(id: string, question: Partial<Omit<Question, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update an option
  async updateOption(id: string, option: Partial<Omit<Option, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('options')
      .update(option)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a question
  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Delete an option
  async deleteOption(id: string) {
    const { error } = await supabase
      .from('options')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 