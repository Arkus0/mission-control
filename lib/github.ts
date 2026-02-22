import { CONFIG } from './config'

export interface GitHubFile {
  name: string
  path: string
  content: string
  sha: string
  html_url: string
}

export interface GitHubArticle {
  id: string
  title: string
  filename: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  htmlUrl?: string
}

class GitHubAPI {
  private baseUrl = CONFIG.GITHUB_BASE_URL
  private token = CONFIG.GITHUB_TOKEN
  private repo = CONFIG.GITHUB_REPO

  private get headers(): Record<string, string> {
    return {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }
  }

  async getArticles(): Promise<GitHubArticle[]> {
    try {
      // Fetch from docs folder (published articles)
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repo}/contents/docs`,
        { headers: this.headers }
      )

      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error('Failed to fetch articles')
      }

      const files = await response.json()
      const htmlFiles = files.filter((f: any) => f.name.endsWith('.html'))

      return htmlFiles.map((f: any) => ({
        id: f.sha.slice(0, 8),
        title: f.name.replace('.html', '').replace(/-/g, ' '),
        filename: f.name,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        htmlUrl: f.html_url,
      }))
    } catch (error) {
      console.error('GitHub API error:', error)
      return []
    }
  }

  async getFileContent(path: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repo}/contents/${path}`,
        { headers: this.headers }
      )

      if (!response.ok) throw new Error('Failed to fetch file')

      const data = await response.json()
      return {
        name: data.name,
        path: data.path,
        content: atob(data.content),
        sha: data.sha,
        html_url: data.html_url,
      }
    } catch (error) {
      console.error('GitHub file error:', error)
      return null
    }
  }

  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<boolean> {
    try {
      const body: any = {
        message,
        content: btoa(content),
      }

      if (sha) {
        body.sha = sha
      }

      const response = await fetch(
        `${this.baseUrl}/repos/${this.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify(body),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save file')
      }

      return true
    } catch (error) {
      console.error('GitHub save error:', error)
      return false
    }
  }

  async deleteFile(path: string, message: string): Promise<boolean> {
    try {
      // First get the file to get its SHA
      const file = await this.getFileContent(path)
      if (!file) return false

      const response = await fetch(
        `${this.baseUrl}/repos/${this.repo}/contents/${path}`,
        {
          method: 'DELETE',
          headers: this.headers,
          body: JSON.stringify({
            message,
            sha: file.sha,
          }),
        }
      )

      return response.ok
    } catch (error) {
      console.error('GitHub delete error:', error)
      return false
    }
  }

  async getRepoInfo(): Promise<{
    stars: number
    forks: number
    openIssues: number
    lastUpdated: string
  } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repo}`,
        { headers: this.headers }
      )

      if (!response.ok) throw new Error('Failed to fetch repo info')

      const data = await response.json()
      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastUpdated: data.updated_at,
      }
    } catch (error) {
      console.error('GitHub repo error:', error)
      return null
    }
  }
}

export const github = new GitHubAPI()
