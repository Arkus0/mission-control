import { useState, useEffect, useCallback } from 'react'

// Generic hook for localStorage persistence
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
        return valueToStore
      })
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue]
}

// Hook for API usage tracking
export function useApiUsage() {
  const [usage, setUsage] = useLocalStorage<Array<{
    id: string
    provider: string
    model: string
    cost: number
    tokens: number
    timestamp: string
    articleId?: string
  }>>('mission-control-api-usage', [])

  const addUsage = useCallback((entry: {
    provider: string
    model: string
    cost: number
    tokens: number
    articleId?: string
  }) => {
    setUsage(prev => [{
      id: Date.now().toString(),
      ...entry,
      timestamp: new Date().toISOString(),
    }, ...prev])
  }, [setUsage])

  const clearUsage = useCallback(() => {
    setUsage([])
  }, [setUsage])

  const stats = {
    totalCost: usage.reduce((sum, u) => sum + u.cost, 0),
    totalTokens: usage.reduce((sum, u) => sum + u.tokens, 0),
    totalCalls: usage.length,
    avgCost: usage.length > 0 ? usage.reduce((sum, u) => sum + u.cost, 0) / usage.length : 0,
  }

  return { usage, addUsage, clearUsage, stats }
}

// Hook for prompts
export function usePrompts() {
  const [prompts, setPrompts] = useLocalStorage<Array<{
    id: string
    name: string
    content: string
    tags: string[]
    usageCount: number
    lastUsed?: string
    createdAt: string
  }>>('mission-control-prompts', [])

  const addPrompt = useCallback((prompt: Omit<typeof prompts[0], 'id' | 'usageCount' | 'createdAt'>) => {
    setPrompts(prev => [{
      ...prompt,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    }, ...prev])
  }, [setPrompts])

  const updatePrompt = useCallback((id: string, updates: Partial<typeof prompts[0]>) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }, [setPrompts])

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id))
  }, [setPrompts])

  const incrementUsage = useCallback((id: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, usageCount: p.usageCount + 1, lastUsed: new Date().toISOString() }
        : p
    ))
  }, [setPrompts])

  return { prompts, addPrompt, updatePrompt, deletePrompt, incrementUsage }
}

// Hook for research sources
export function useResearchSources() {
  const [sources, setSources] = useLocalStorage<Array<{
    id: string
    title: string
    url: string
    description: string
    tags: string[]
    articleId?: string
    articleTitle?: string
    createdAt: string
    isArchived: boolean
    quotes: string[]
  }>>('mission-control-research', [])

  const addSource = useCallback((source: Omit<typeof sources[0], 'id' | 'createdAt' | 'isArchived' | 'quotes'> & { quotes?: string[] }) => {
    setSources(prev => [{
      ...source,
      quotes: source.quotes || [],
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isArchived: false,
    }, ...prev])
  }, [setSources])

  const updateSource = useCallback((id: string, updates: Partial<typeof sources[0]>) => {
    setSources(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ))
  }, [setSources])

  const deleteSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id))
  }, [setSources])

  const toggleArchive = useCallback((id: string) => {
    setSources(prev => prev.map(s => 
      s.id === id ? { ...s, isArchived: !s.isArchived } : s
    ))
  }, [setSources])

  return { sources, addSource, updateSource, deleteSource, toggleArchive }
}

// Hook for calendar events
export function useCalendarEvents() {
  const [events, setEvents] = useLocalStorage<Array<{
    id: string
    title: string
    date: string
    type: 'article' | 'research' | 'review' | 'publish' | 'other'
    status: 'planned' | 'in-progress' | 'completed' | 'overdue'
    description?: string
    articleId?: string
  }>>('mission-control-calendar', [])

  const addEvent = useCallback((event: Omit<typeof events[0], 'id' | 'status'>) => {
    setEvents(prev => [{
      ...event,
      id: Date.now().toString(),
      status: 'planned',
    }, ...prev])
  }, [setEvents])

  const updateEvent = useCallback((id: string, updates: Partial<typeof events[0]>) => {
    setEvents(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ))
  }, [setEvents])

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [setEvents])

  const cycleStatus = useCallback((id: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e
      const statuses: Array<typeof e.status> = ['planned', 'in-progress', 'completed']
      const currentIndex = statuses.indexOf(e.status)
      const nextStatus = statuses[(currentIndex + 1) % statuses.length]
      return { ...e, status: nextStatus }
    }))
  }, [setEvents])

  return { events, addEvent, updateEvent, deleteEvent, cycleStatus }
}

// Hook for articles (combines local + GitHub)
export function useArticles() {
  const [articles, setArticles] = useLocalStorage<Array<{
    id: string
    title: string
    topic: string
    status: 'draft' | 'review' | 'approved' | 'published'
    createdAt: string
    updatedAt: string
    cost: number
    models: string[]
    url?: string
    githubPath?: string
  }>>('mission-control-articles', [])

  const addArticle = useCallback((article: Omit<typeof articles[0], 'id' | 'createdAt' | 'updatedAt' | 'cost' | 'models'>) => {
    const now = new Date().toISOString()
    setArticles(prev => [{
      ...article,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      cost: 0,
      models: [],
    }, ...prev])
  }, [setArticles])

  const updateArticle = useCallback((id: string, updates: Partial<typeof articles[0]>) => {
    setArticles(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ))
  }, [setArticles])

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id))
  }, [setArticles])

  const addCost = useCallback((id: string, cost: number, model: string) => {
    setArticles(prev => prev.map(a => 
      a.id === id 
        ? { 
            ...a, 
            cost: a.cost + cost,
            models: a.models.includes(model) ? a.models : [...a.models, model],
            updatedAt: new Date().toISOString()
          } 
        : a
    ))
  }, [setArticles])

  return { articles, addArticle, updateArticle, deleteArticle, addCost }
}
