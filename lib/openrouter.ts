import { CONFIG } from './config'

export interface OpenRouterModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: number
    completion: number
  }
  context_length: number
}

export interface OpenRouterUsage {
  model: string
  tokens_prompt: number
  tokens_completion: number
  cost: number
  timestamp: string
}

class OpenRouterAPI {
  private baseUrl = CONFIG.OPENROUTER_BASE_URL
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://arkus0.github.io/mission-control/',
      'X-Title': 'Mission Control Dashboard',
    }
  }

  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.headers,
      })
      
      if (!response.ok) throw new Error('Failed to fetch models')
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('OpenRouter API error:', error)
      return []
    }
  }

  async getCredits(): Promise<{ credits: number; usage: number } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/credits`, {
        headers: this.headers,
      })
      
      if (!response.ok) throw new Error('Failed to fetch credits')
      
      return await response.json()
    } catch (error) {
      console.error('OpenRouter credits error:', error)
      return null
    }
  }

  async generateCompletion(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<{
    content: string
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
      cost: number
    }
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 4000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'API request failed')
      }

      const data = await response.json()
      
      // Calculate cost based on pricing
      const modelInfo = await this.getModelPricing(model)
      const promptCost = (data.usage.prompt_tokens / 1000) * (modelInfo?.pricing.prompt || 0)
      const completionCost = (data.usage.completion_tokens / 1000) * (modelInfo?.pricing.completion || 0)
      const totalCost = promptCost + completionCost

      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          ...data.usage,
          cost: totalCost,
        },
      }
    } catch (error) {
      console.error('OpenRouter completion error:', error)
      return null
    }
  }

  private async getModelPricing(modelId: string): Promise<OpenRouterModel | null> {
    const models = await this.getModels()
    return models.find(m => m.id === modelId) || null
  }
}

export const openRouter = new OpenRouterAPI()
