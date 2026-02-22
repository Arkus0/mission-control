"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Plus, 
  Link2, 
  Trash2, 
  ExternalLink, 
  BookOpen, 
  Quote, 
  Tag,
  Search,
  Archive,
  Clock,
  CheckCircle2
} from "lucide-react"
import { useResearchSources } from "@/hooks/useStorage"

export function ResearchDashboard() {
  const { sources, addSource, updateSource, deleteSource, toggleArchive } = useResearchSources()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewingSource, setViewingSource] = useState<typeof sources[0] | null>(null)
  
  const [newSource, setNewSource] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
    quotes: ""
  })

  const allTags = Array.from(new Set(sources.flatMap(s => s.tags)))

  const filteredSources = sources.filter(source => {
    const matchesSearch = 
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => source.tags.includes(tag))
    const matchesArchive = showArchived || !source.isArchived
    return matchesSearch && matchesTags && matchesArchive
  })

  const activeSources = sources.filter(s => !s.isArchived).length
  const archivedSources = sources.filter(s => s.isArchived).length
  const totalQuotes = sources.reduce((sum, s) => sum + s.quotes.length, 0)
  const linkedArticles = new Set(sources.filter(s => s.articleId).map(s => s.articleId)).size

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleAddSource = () => {
    const tags = newSource.tags.split(",").map(t => t.trim()).filter(Boolean)
    const quotes = newSource.quotes.split("\n").map(q => q.trim()).filter(Boolean)
    
    addSource({
      title: newSource.title,
      url: newSource.url,
      description: newSource.description,
      tags,
      quotes
    })
    
    setNewSource({ title: "", url: "", description: "", tags: "", quotes: "" })
    setIsAddOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Active Sources</p>
                <p className="text-2xl font-bold">{activeSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Quote className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Saved Quotes</p>
                <p className="text-2xl font-bold">{totalQuotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <Link2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Linked Articles</p>
                <p className="text-2xl font-bold">{linkedArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Archive className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Archived</p>
                <p className="text-2xl font-bold">{archivedSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant={showArchived ? "default" : "outline"} 
          onClick={() => setShowArchived(!showArchived)}
          className="gap-2"
        >
          <Archive className="w-4 h-4" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Sources Grid */}
      <div className="grid gap-4">
        {filteredSources.map((source) => (
          <Card 
            key={source.id} 
            className={`bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 transition-colors ${
              source.isArchived ? 'opacity-60' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{source.title}</h4>
                    {source.isArchived && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400">
                        Archived
                      </Badge>
                    )}
                    {source.quotes.length > 0 && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                        {source.quotes.length} quotes
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-2">{source.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {source.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>

                  {source.articleTitle && (
                    <p className="text-sm text-emerald-400 mb-2">
                      Linked to: {source.articleTitle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(source.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setViewingSource(source)}
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleArchive(source.id)}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteSource(source.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Source Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Research Source</DialogTitle>
            <DialogDescription>Save a source for future reference.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Source title"
                value={newSource.title}
                onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL</label>
              <Input
                placeholder="https://..."
                value={newSource.url}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Brief description of the source..."
                value={newSource.description}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
              <Input
                placeholder="philosophy, science, reference"
                value={newSource.tags}
                onChange={(e) => setNewSource({ ...newSource, tags: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Key Quotes (one per line)</label>
              <Textarea
                placeholder="Paste important quotes here..."
                value={newSource.quotes}
                onChange={(e) => setNewSource({ ...newSource, quotes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddSource} 
              disabled={!newSource.title || !newSource.url}
            >
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Source Dialog */}
      <Dialog open={!!viewingSource} onOpenChange={() => setViewingSource(null)}>
        <DialogContent className="max-w-2xl">
          {viewingSource && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingSource.title}</DialogTitle>
                <DialogDescription>
                  <a 
                    href={viewingSource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {viewingSource.url}
                  </a>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-zinc-300">{viewingSource.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {viewingSource.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                {viewingSource.quotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-zinc-400">Saved Quotes</h4>
                    {viewingSource.quotes.map((quote, i) => (
                      <blockquote key={i} className="border-l-2 border-purple-500 pl-4 py-1 text-zinc-300 italic">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                )}

                {viewingSource.articleTitle && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm text-emerald-400">
                      Linked to article: {viewingSource.articleTitle}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
