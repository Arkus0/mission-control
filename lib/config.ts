// API Configuration
// Keys can be set at runtime via window.__CONFIG__ or localStorage

const getConfig = () => {
  if (typeof window !== 'undefined') {
    // First try window.__CONFIG__
    const win = window as any
    if (win.__CONFIG__?.OPENROUTER_API_KEY) {
      return win.__CONFIG__
    }
    // Then try localStorage
    const orKey = localStorage.getItem('OPENROUTER_API_KEY')
    const ghToken = localStorage.getItem('GITHUB_TOKEN')
    if (orKey || ghToken) {
      return {
        OPENROUTER_API_KEY: orKey || '',
        GITHUB_TOKEN: ghToken || ''
      }
    }
  }
  return {
    OPENROUTER_API_KEY: '',
    GITHUB_TOKEN: ''
  }
}

export const CONFIG = {
  OPENROUTER_API_KEY: getConfig().OPENROUTER_API_KEY,
  GITHUB_TOKEN: getConfig().GITHUB_TOKEN,
  GITHUB_REPO: 'arkus0/juanblog',
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  GITHUB_BASE_URL: 'https://api.github.com',
}

// Login credentials
export const LOGIN = {
  username: 'user',
  password: 'Febrero5febrero@'
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('mission_control_auth') === 'true'
}

// Login
export function login(username: string, password: string): boolean {
  if (username === LOGIN.username && password === LOGIN.password) {
    localStorage.setItem('mission_control_auth', 'true')
    return true
  }
  return false
}

// Logout
export function logout() {
  localStorage.removeItem('mission_control_auth')
}

// Save API keys to localStorage
export function saveApiKeys(openRouterKey: string, githubToken: string) {
  localStorage.setItem('OPENROUTER_API_KEY', openRouterKey)
  localStorage.setItem('GITHUB_TOKEN', githubToken)
  CONFIG.OPENROUTER_API_KEY = openRouterKey
  CONFIG.GITHUB_TOKEN = githubToken
}

// Validate config
export function validateConfig() {
  return !!CONFIG.OPENROUTER_API_KEY && !!CONFIG.GITHUB_TOKEN
}

// Check if specific API is configured
export function isOpenRouterConfigured() {
  return !!CONFIG.OPENROUTER_API_KEY
}

export function isGitHubConfigured() {
  return !!CONFIG.GITHUB_TOKEN
}

// Set keys at runtime (for window.__CONFIG__ injection)
export function setApiKeys(openRouterKey: string, githubToken: string) {
  CONFIG.OPENROUTER_API_KEY = openRouterKey
  CONFIG.GITHUB_TOKEN = githubToken
}
