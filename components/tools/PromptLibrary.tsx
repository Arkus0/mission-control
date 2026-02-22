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
  Search, 
  Copy, 
  Trash2, 
  Edit, 
  Tag,
  Clock,
  Hash,
  Sparkles
} from "lucide-react"
import { usePrompts } from "@/hooks/useStorage"

interface Prompt {
  id: string
  name: string
  content: string
  tags: string[]
  usageCount: number
  lastUsed?: string
  createdAt: string
}

const defaultPrompts: Prompt[] = [
  {
    id: "default-1",
    name: "Article Writer - Philosophy",
    content: `Write a philosophical article on the topic: {{topic}}

Style requirements:
- Academic but accessible
- Include at least 3 philosophical references
- End with open questions for the reader
- Length: 1500-2000 words`,
    tags: ["writing", "philosophy", "article"],
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "Research Assistant",
    content: `Research the following topic and provide:
1. Key historical context
2. Current state of the field
3. Major debates or controversies
4. 3-5 authoritative sources

Topic: {{topic}}`,
    tags: ["research", "academic"],
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Code Review",
    content: `Review this code for:
- Potential bugs
- Performance issues
- Security vulnerabilities
- Best practices violations

Provide specific line-by-line feedback and suggest improvements.`,
    tags: ["coding", "review", "technical"],
    usageCount: 0,
    createdAt: new Date().toISOString(),
  },
]

export function PromptLibrary() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, incrementUsage } = usePrompts()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    content: "",
    tags: ""
  })

  // Initialize default prompts if empty
  const allPrompts = prompts.length === 0 ? defaultPrompts : prompts

  const allTags = Array.from(new Set(allPrompts.flatMap(p => p.tags)))

  const filteredPrompts = allPrompts.filter(prompt => {
    const matchesSearch = 
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => prompt.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleCopy = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content)
    setCopiedId(prompt.id)
    setTimeout(() => setCopiedId(null), 2000)
    
    // Only increment if it's a user-created prompt (not default)
    if (!prompt.id.startsWith('default-')) {
      incrementUsage(prompt.id)
    }
  }

  const handleDelete = (id: string) => {
    deletePrompt(id)
  }

  const handleSave = () => {
    const tags = newPrompt.tags.split(",").map(t => t.trim()).filter(Boolean)
    
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, {
        name: newPrompt.name,
        content: newPrompt.content,
        tags
      })
    } else {
      addPrompt({
        name: newPrompt.name,
        content: newPrompt.content,
        tags
      })
    }
    
    setNewPrompt({ name: "", content: "", tags: "" })
    setEditingPrompt(null)
    setIsCreateOpen(false)
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setNewPrompt({
      name: prompt.name,
      content: prompt.content,
      tags: prompt.tags.join(", ")
    })
    setIsCreateOpen(true)
  }

  const totalUsage = allPrompts.reduce((sum, p) => sum + p.usageCount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Hash className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Prompts</p>
                <p className="text-2xl font-bold">{allPrompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Copy className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Uses</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Tag className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Categories</p>
                <p className="text-2xl font-bold">{allTags.length}</p>
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
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Prompt
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

      {/* Prompts Grid */}
      <div className="grid gap-4">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{prompt.name}</h4>
                    {prompt.id.startsWith('default-') && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      {prompt.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <pre className="text-sm text-zinc-400 bg-zinc-950/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {prompt.content.slice(0, 200)}{prompt.content.length > 200 && "..."}
                  </pre>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      {prompt.usageCount} uses
                    </span>
                    {prompt.lastUsed && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last used {new Date(prompt.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(prompt)}
                    className={copiedId === prompt.id ? "text-green-400" : ""}
                  >
                    {copiedId === prompt.id ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(prompt)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
            <DialogDescription>
              {editingPrompt ? "Update your prompt details." : "Add a new prompt to your library."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="e.g., Article Writer"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
              />
            </div>            
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                placeholder="Enter your prompt..."
                value={newPrompt.content}
                onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                rows={8}
              />
            </div>            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
              <Input
                placeholder="writing, research, coding"
                value={newPrompt.tags}
                onChange={(e) => setNewPrompt({ ...newPrompt, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false)
              setEditingPrompt(null)
              setNewPrompt({ name: "", content: "", tags: "" })
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!newPrompt.name || !newPrompt.content}>
              {editingPrompt ? "Save Changes" : "Create Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
