import { supabase } from '@/lib/supabase'
import { Learning, LearningSection, LearningQuiz, LearningWithSections } from '@/types/database'

export const learningService = {
  async createLearning(learning: Omit<Learning, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('learnings')
        .insert(learning)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating learning:', error)
      throw new Error('Failed to create learning content')
    }
  },

  async getLearnings() {
    try {
      const { data, error } = await supabase
        .from('learnings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching learnings:', error)
      throw new Error('Failed to fetch learning content')
    }
  },

  async getLearning(id: string) {
    try {
      // Get learning data
      const { data: learning, error: learningError } = await supabase
        .from('learnings')
        .select('*')
        .eq('id', id)
        .single()

      if (learningError) throw learningError

      // Get sections
      const { data: sections, error: sectionsError } = await supabase
        .from('learning_sections')
        .select('*')
        .eq('learning_id', id)
        .order('order', { ascending: true })

      if (sectionsError) throw sectionsError

      // Get linked quiz IDs
      const { data: learningQuizzes, error: quizzesError } = await supabase
        .from('learning_quizzes')
        .select('id, quiz_id')
        .eq('learning_id', id)

      if (quizzesError) throw quizzesError

      // Get quiz details for each linked quiz
      const quizDetails = await Promise.all(
        learningQuizzes.map(async (link) => {
          const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('id, title, description')
            .eq('id', link.quiz_id)
            .single()

          if (quizError) throw quizError

          return {
            ...link,
            quizzes: quiz,
          }
        })
      )

      return {
        ...learning,
        sections,
        quizzes: quizDetails,
      } as LearningWithSections
    } catch (error) {
      console.error('Error fetching learning:', error)
      throw new Error('Failed to fetch learning content')
    }
  },

  async updateLearning(id: string, learning: Partial<Omit<Learning, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('learnings')
        .update(learning)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating learning:', error)
      throw new Error('Failed to update learning content')
    }
  },

  async deleteLearning(id: string) {
    try {
      const { error } = await supabase
        .from('learnings')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting learning:', error)
      throw new Error('Failed to delete learning content')
    }
  },

  async createSection(section: Omit<LearningSection, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Validate required fields
      if (!('learning_id' in section)) {
        throw new Error('Learning ID is required')
      }
      if (!('title' in section)) {
        throw new Error('Section title is required')
      }
      if (!('content' in section)) {
        throw new Error('Section content is required')
      }
      if (!('type' in section)) {
        throw new Error('Section type is required')
      }
      if (!('order' in section)) {
        throw new Error('Section order is required')
      }

      const { data, error } = await supabase
        .from('learning_sections')
        .insert(section)
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating section:', error)
        throw new Error(error.message || 'Failed to create section')
      }

      if (!data) {
        throw new Error('No data returned after creating section')
      }

      return data
    } catch (error) {
      console.error('Error creating section:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create section')
    }
  },

  async updateSection(id: string, section: Partial<Omit<LearningSection, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('learning_sections')
        .update(section)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating section:', error)
      throw new Error('Failed to update section')
    }
  },

  async deleteSection(id: string) {
    try {
      const { error } = await supabase
        .from('learning_sections')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting section:', error)
      throw new Error('Failed to delete section')
    }
  },

  async linkQuiz(learningId: string, quizId: string) {
    try {
      const { data, error } = await supabase
        .from('learning_quizzes')
        .insert({
          learning_id: learningId,
          quiz_id: quizId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error linking quiz:', error)
      throw new Error('Failed to link quiz')
    }
  },

  async unlinkQuiz(learningId: string, quizId: string) {
    try {
      const { error } = await supabase
        .from('learning_quizzes')
        .delete()
        .eq('learning_id', learningId)
        .eq('quiz_id', quizId)

      if (error) throw error
    } catch (error) {
      console.error('Error unlinking quiz:', error)
      throw new Error('Failed to unlink quiz')
    }
  },

  async getAvailableQuizzes(learningId: string) {
    try {
      // Get all quizzes that are not already linked to this learning
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, description')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching available quizzes:', error)
      throw new Error('Failed to fetch available quizzes')
    }
  },
} 