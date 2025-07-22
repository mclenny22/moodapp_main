import { createClient } from './supabase'

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  content: string
  summary: string
  sentiment_score: number
  tags: string[]
  memory_weight: number
  created_at: string
  updated_at: string
}

export interface EntryAnalysis {
  sentiment_score: number
  summary: string
  tags: string[]
  memory_weight: number
}

const supabase = createClient()

export async function createJournalEntry(
  userId: string,
  content: string,
  analysis: EntryAnalysis
): Promise<JournalEntry | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        content,
        summary: analysis.summary,
        sentiment_score: analysis.sentiment_score,
        tags: analysis.tags,
        memory_weight: analysis.memory_weight
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating journal entry:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return null
  }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching journal entries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return []
  }
}

export async function getJournalEntriesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<JournalEntry[]> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching journal entries by date range:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching journal entries by date range:', error)
    return []
  }
}

export async function getAverageSentiment(userId: string, days: number): Promise<number> {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('entries')
      .select('sentiment_score')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Error fetching average sentiment:', error)
      return 0
    }

    if (!data || data.length === 0) {
      return 0
    }

    const totalSentiment = data.reduce((sum, entry) => sum + entry.sentiment_score, 0)
    return totalSentiment / data.length
  } catch (error) {
    console.error('Error calculating average sentiment:', error)
    return 0
  }
}

export async function getCommonTags(userId: string): Promise<{ tag: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('tags')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    if (!data) return []

    // Count tag occurrences
    const tagCounts: { [key: string]: number } = {}
    data.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 tags
  } catch (error) {
    console.error('Error calculating common tags:', error)
    return []
  }
}

export async function getTodaysEntry(userId: string): Promise<JournalEntry | null> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No entry found for today
        return null
      }
      console.error('Error fetching today\'s entry:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching today\'s entry:', error)
    return null
  }
}

export async function updateJournalEntry(
  entryId: string,
  userId: string,
  content: string,
  analysis: EntryAnalysis
): Promise<JournalEntry | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .update({
        content,
        summary: analysis.summary,
        sentiment_score: analysis.sentiment_score,
        tags: analysis.tags,
        memory_weight: analysis.memory_weight,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating journal entry:', error)
      return null
    }

    console.log('Successfully updated journal entry:', data)
    return data
  } catch (error) {
    console.error('Exception updating journal entry:', error)
    return null
  }
} 