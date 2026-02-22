"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Key, CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react"
import { saveApiKeys, validateConfig, CONFIG } from "@/lib/config"

export function ApiConfig() {
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [showKeys, setShowKeys] = useState(false)

  useEffect(() => {
    setOpenRouterKey(CONFIG.OPENROUTER_API_KEY)
    setGithubToken(CONFIG.GITHUB_TOKEN)
    setIsConfigured(validateConfig())
  }, [])

  const handleSave = () => {
    saveApiKeys(openRouterKey, githubToken)
    setIsConfigured(validateConfig())
  }

  const handleClear = () => {
    setOpenRouterKey("")
    setGithubToken("")
    saveApiKeys("", "")
    setIsConfigured(false)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">API Configuration</CardTitle>
              <CardDescription>Connect your API keys for live data</CardDescription>
            </div>
          </div>
          
          {isConfigured ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1">
              <AlertCircle className="w-3 h-3" />
              Not Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 flex items-center justify-between">
            <span>OpenRouter API Key</span>
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 flex items-center gap-1"
            >
              Get key <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <Input
            type={showKeys ? "text" : "password"}
            placeholder="sk-or-v1-..."
            value={openRouterKey}
            onChange={(e) => setOpenRouterKey(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 flex items-center justify-between">
            <span>GitHub Token</span>
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 flex items-center gap-1"
            >
              Get token <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <Input
            type={showKeys ? "text" : "password"}
            placeholder="ghp_..."
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowKeys(!showKeys)}
            className="gap-2"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? "Hide" : "Show"}
          </Button>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClear}>Clear</Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </div>
        
        {isConfigured && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
            ✅ APIs configured! Your data will now sync with OpenRouter and GitHub.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
