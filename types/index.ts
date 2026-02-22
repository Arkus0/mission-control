export interface Article {
  id: string
  title: string
  topic: string
  status: 'draft' | 'review' | 'approved' | 'published'
  createdAt: string
  updatedAt: string
  cost: number
  models: string[]
  url?: string
}

export interface ApiUsage {
  id: string
  provider: string
  model: string
  cost: number
  tokens: number
  timestamp: string
  articleId?: string
}

export interface Prompt {
  id: string
  name: string
  content: string
  tags: string[]
  usageCount: number
  lastUsed?: string
  createdAt: string
}

export interface DashboardStats {
  totalArticles: number
  totalCost: number
  totalTokens: number
  activePrompts: number
}
