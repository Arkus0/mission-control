"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FileText, Plus, ExternalLink, Clock, DollarSign, Bot, Trash2, Edit, RefreshCw, Github } from "lucide-react"
import { useArticles } from "@/hooks/useStorage"
import { github } from "@/lib/github"
import { openRouter } from "@/lib/openrouter"

const statusColors = {
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  review: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
}

export function ContentPipeline() {
  const { articles, addArticle, updateArticle, deleteArticle, addCost } = useArticles()
  const [newTopic, setNewTopic] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [githubArticles, setGithubArticles] = useState<Array<{
    id: string
    title: string
    filename: string
    status: 'published'
    htmlUrl?: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch articles from GitHub on mount
  useEffect(() => {
    fetchGithubArticles()
  }, [])

  const fetchGithubArticles = async () => {
    setIsLoading(true)
    try {
      const articles = await github.getArticles()
      setGithubArticles(articles.map(a => ({
        id: a.id,
        title: a.title,
        filename: a.filename,
        status: 'published' as const,
        htmlUrl: a.htmlUrl,
      })))
    } catch (error) {
      console.error('Failed to fetch GitHub articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Merge local articles with GitHub articles
  const allArticles = [
    ...articles.map(a => ({
      ...a,
      source: 'local' as const
    })),
    ...githubArticles
      .filter(ga => !articles.some(a => a.githubPath === ga.filename))
      .map(ga => ({
        id: ga.id,
        title: ga.title,
        topic: ga.title,
        status: 'published' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cost: 0,
        models: [] as string[],
        githubPath: ga.filename,
        htmlUrl: ga.htmlUrl,
        source: 'github' as const
      }))
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleCreateArticle = () => {
    if (!newTopic.trim()) return
    
    addArticle({
      title: newTopic,
      topic: newTopic,
      status: "draft",
    })
    
    setNewTopic("")
    setIsCreateOpen(false)
  }

  const handleGenerateWithAI = async () => {
    if (!newTopic.trim()) return
    
    setIsGenerating(true)
    try {
      // Create article first
      const articleId = Date.now().toString()
      addArticle({
        title: newTopic,
        topic: newTopic,
        status: "draft",
      })

      // Generate content with OpenRouter
      const result = await openRouter.generateCompletion(
        'anthropic/claude-3.5-sonnet',
        [
          {
            role: 'system',
            content: 'You are a professional writer specializing in philosophical and scientific articles. Write in an academic but accessible style.'
          },
          {
            role: 'user',
            content: `Write an article about: ${newTopic}\n\nRequirements:\n- Length: 1500-2000 words\n- Include relevant references\n- End with thought-provoking questions\n- Use markdown formatting`
          }
        ],
        { temperature: 0.7, max_tokens: 4000 }
      )

      if (result) {
        // Track cost
        addCost(articleId, result.usage.cost, 'claude-3.5-sonnet')
        
        // TODO: Save to GitHub
        console.log('Generated content:', result.content.slice(0, 200))
      }

      setNewTopic("")
      setIsCreateOpen(false)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = (id: string) => {
    deleteArticle(id)
  }

  const handleStatusChange = (id: string, newStatus: typeof articles[0]['status']) => {
    updateArticle(id, { status: newStatus })
  }

  const totalCost = articles.reduce((sum, a) => sum + a.cost, 0)
  const publishedCount = allArticles.filter(a => a.status === "published").length
  const draftCount = allArticles.filter(a => a.status === "draft").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Articles</p>
                <p className="text-2xl font-bold">{allArticles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Edit className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Drafts</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <ExternalLink className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Published</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Articles</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGithubArticles}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync GitHub
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>
      </div>

      {/* Articles List */}
      <div className="grid gap-4">
        {allArticles.map((article) => (
          <Card key={article.id} className="bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold truncate">{article.title}</h4>
                    <Badge variant="outline" className={statusColors[article.status]}>
                      {article.status}
                    </Badge>
                    {'source' in article && article.source === 'github' && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                        <Github className="w-3 h-3 mr-1" />
                        GitHub
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                    {'cost' in article && article.cost > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${article.cost.toFixed(3)}
                      </span>
                    )}
                    {'models' in article && article.models.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {article.models.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {'htmlUrl' in article && article.htmlUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={article.htmlUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  
                  {article.status !== 'published' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(article.id, 
                          article.status === 'draft' ? 'review' : 'approved'
                        )}
                      >
                        Advance
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>
              Enter a topic to start the content pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., The Future of Quantum Computing"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateArticle()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateArticle}>Create Draft</Button>
            <Button 
              onClick={handleGenerateWithAI} 
              disabled={isGenerating}
              className="gap-2"
            >
              <Bot className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
