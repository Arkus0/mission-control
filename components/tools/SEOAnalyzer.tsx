"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Type,
  Hash,
  Search,
  Eye,
  Link2,
  ImageIcon,
  BarChart3,
  Sparkles,
  Copy,
  RotateCcw
} from "lucide-react"

interface SEOAnalysis {
  score: number
  readability: {
    score: number
    fleschKincaid: number
    wordCount: number
    sentenceCount: number
    avgSentenceLength: number
    grade: string
  }
  keywords: {
    density: Record<string, number>
    topKeywords: Array<{ word: string; count: number; density: number }>
    suggestions: string[]
  }
  meta: {
    titleLength: number
    descriptionLength: number
    hasTitle: boolean
    hasDescription: boolean
    titleOptimal: boolean
    descriptionOptimal: boolean
  }
  structure: {
    hasH1: boolean
    h2Count: number
    h3Count: number
    paragraphCount: number
    hasImages: boolean
    hasLinks: boolean
    internalLinks: number
    externalLinks: number
  }
  suggestions: Array<{
    type: 'error' | 'warning' | 'success'
    message: string
    priority: number
  }>
}

function analyzeSEO(content: string, title: string, description: string): SEOAnalysis {
  const words = content.toLowerCase().match(/\b\w+\b/g) || []
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
  
  // Word count
  const wordCount = words.length
  
  // Sentence analysis
  const sentenceCount = sentences.length
  const avgSentenceLength = wordCount / (sentenceCount || 1)
  
  // Flesch-Kincaid Grade Level
  const syllables = words.reduce((count, word) => {
    return count + (word.match(/[aeiou]/gi) || []).length
  }, 0)
  const fleschKincaid = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59
  
  // Readability grade
  let grade = 'Easy'
  if (fleschKincaid > 12) grade = 'College'
  else if (fleschKincaid > 8) grade = 'High School'
  else if (fleschKincaid > 5) grade = 'Middle School'
  
  // Keyword density
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'and', 'but', 'or', 'yet', 'so', 'if', 'because', 'although', 'though', 'while', 'where', 'when', 'that', 'which', 'who', 'whom', 'whose', 'what', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'])
  
  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })
  
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: (count / wordCount) * 100
    }))
  
  const keywordDensity: Record<string, number> = {}
  topKeywords.forEach(k => {
    keywordDensity[k.word] = k.density
  })
  
  // Structure analysis
  const hasH1 = content.includes('# ')
  const h2Count = (content.match(/^## /gm) || []).length
  const h3Count = (content.match(/^### /gm) || []).length
  const hasImages = content.includes('![')
  const internalLinks = (content.match(/\[.*?\]\(.*?\)/g) || []).filter(l => !l.includes('http')).length
  const externalLinks = (content.match(/\[.*?\]\(https?:\/\//g) || []).length
  
  // Meta analysis
  const titleLength = title.length
  const descriptionLength = description.length
  const hasTitle = title.length > 0
  const hasDescription = description.length > 0
  const titleOptimal = titleLength >= 30 && titleLength <= 60
  const descriptionOptimal = descriptionLength >= 120 && descriptionLength <= 160
  
  // Generate suggestions
  const suggestions: SEOAnalysis['suggestions'] = []
  
  if (!hasTitle) {
    suggestions.push({ type: 'error', message: 'Missing meta title', priority: 10 })
  } else if (!titleOptimal) {
    suggestions.push({ type: 'warning', message: `Title length (${titleLength}) should be 30-60 characters`, priority: 8 })
  } else {
    suggestions.push({ type: 'success', message: 'Title length is optimal', priority: 1 })
  }
  
  if (!hasDescription) {
    suggestions.push({ type: 'error', message: 'Missing meta description', priority: 9 })
  } else if (!descriptionOptimal) {
    suggestions.push({ type: 'warning', message: `Description length (${descriptionLength}) should be 120-160 characters`, priority: 7 })
  } else {
    suggestions.push({ type: 'success', message: 'Description length is optimal', priority: 1 })
  }
  
  if (wordCount < 300) {
    suggestions.push({ type: 'error', message: `Content too short (${wordCount} words). Aim for 1000+ words`, priority: 10 })
  } else if (wordCount < 1000) {
    suggestions.push({ type: 'warning', message: `Consider expanding content (${wordCount} words). 1500+ is ideal`, priority: 6 })
  } else {
    suggestions.push({ type: 'success', message: 'Content length is good', priority: 1 })
  }
  
  if (!hasH1) {
    suggestions.push({ type: 'error', message: 'Missing H1 heading', priority: 9 })
  }
  
  if (h2Count === 0) {
    suggestions.push({ type: 'warning', message: 'Add H2 subheadings for better structure', priority: 5 })
  }
  
  if (!hasImages) {
    suggestions.push({ type: 'warning', message: 'Consider adding images', priority: 4 })
  }
  
  if (externalLinks === 0) {
    suggestions.push({ type: 'warning', message: 'Add external links to authoritative sources', priority: 3 })
  }
  
  if (avgSentenceLength > 25) {
    suggestions.push({ type: 'warning', message: 'Sentences are too long. Aim for 15-20 words average', priority: 5 })
  }
  
  // Calculate overall score
  let score = 100
  suggestions.forEach(s => {
    if (s.type === 'error') score -= 15
    else if (s.type === 'warning') score -= 8
  })
  score = Math.max(0, Math.min(100, score))
  
  // Readability score (0-100)
  const readabilityScore = Math.max(0, Math.min(100, 100 - fleschKincaid * 5))
  
  return {
    score,
    readability: {
      score: Math.round(readabilityScore),
      fleschKincaid: Math.round(fleschKincaid * 10) / 10,
      wordCount,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      grade
    },
    keywords: {
      density: keywordDensity,
      topKeywords,
      suggestions: topKeywords.slice(0, 3).map(k => k.word)
    },
    meta: {
      titleLength,
      descriptionLength,
      hasTitle,
      hasDescription,
      titleOptimal,
      descriptionOptimal
    },
    structure: {
      hasH1,
      h2Count,
      h3Count,
      paragraphCount: paragraphs.length,
      hasImages,
      hasLinks: internalLinks + externalLinks > 0,
      internalLinks,
      externalLinks
    },
    suggestions: suggestions.sort((a, b) => b.priority - a.priority)
  }
}

export function SEOAnalyzer() {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)

  const handleAnalyze = () => {
    if (!content.trim()) return
    const result = analyzeSEO(content, title, description)
    setAnalysis(result)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Meta Title</label>
              <Input
                placeholder="Article title (30-60 chars)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
              />
              <p className={`text-xs mt-1 ${title.length > 60 ? 'text-red-400' : 'text-zinc-500'}`}>
                {title.length}/60 characters
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Meta Description</label>
              <Input
                placeholder="Brief description (120-160 chars)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={170}
              />
              <p className={`text-xs mt-1 ${description.length > 160 ? 'text-red-400' : 'text-zinc-500'}`}>
                {description.length}/160 characters
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Article Content</label>
            <Textarea
              placeholder="Paste your article content here (Markdown supported)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Analyze Content
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setContent("")
                setTitle("")
                setDescription("")
                setAnalysis(null)
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <>
          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${analysis.score * 3.52} 352`}
                      className={getScoreColor(analysis.score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {analysis.score >= 80 ? 'Excellent!' : 
                     analysis.score >= 60 ? 'Good, but can improve' : 
                     'Needs significant improvement'}
                  </h3>
                  <p className="text-zinc-400">
                    {analysis.score >= 80 ? 'Your content is well-optimized for search engines.' :
                     analysis.score >= 60 ? 'Fix the warnings to improve your SEO score.' :
                     'Address the critical issues before publishing.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="bg-zinc-900 border-zinc-800">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="readability">Readability</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="mt-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-800">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        {suggestion.type === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        {suggestion.type === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        )}
                        {suggestion.type === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={
                            suggestion.type === 'error' ? 'text-red-400' :
                            suggestion.type === 'warning' ? 'text-amber-400' :
                            'text-emerald-400'
                          }>
                            {suggestion.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Readability Tab */}
            <TabsContent value="readability" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type className="w-5 h-5 text-blue-400" />
                      Readability Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-blue-400">
                        {analysis.readability.score}
                      </p>
                      <p className="text-zinc-400 mt-2">
                        Grade Level: {analysis.readability.grade}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Flesch-Kincaid: {analysis.readability.fleschKincaid}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Content Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Word Count</span>
                      <span className="font-mono">{analysis.readability.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Sentences</span>
                      <span className="font-mono">{analysis.readability.sentenceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Avg Sentence Length</span>
                      <span className="font-mono">{analysis.readability.avgSentenceLength} words</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="mt-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="w-5 h-5 text-purple-400" />
                    Top Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.keywords.topKeywords.map((keyword, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-8 text-zinc-500">#{i + 1}</span>
                        <span className="flex-1 font-medium">{keyword.word}</span>
                        <span className="text-zinc-400">{keyword.count} times</span>
                        <div className="w-24">
                          <Progress value={keyword.density * 10} className="h-2" />
                        </div>
                        <span className="text-zinc-500 w-16 text-right">
                          {keyword.density.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Structure Tab */}
            <TabsContent value="structure" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{analysis.structure.h2Count}</p>
                    <p className="text-sm text-zinc-400">H2 Headings</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{analysis.structure.h3Count}</p>
                    <p className="text-sm text-zinc-400">H3 Headings</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{analysis.structure.paragraphCount}</p>
                    <p className="text-sm text-zinc-400">Paragraphs</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{analysis.structure.internalLinks + analysis.structure.externalLinks}</p>
                    <p className="text-sm text-zinc-400">Total Links</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className={`border ${analysis.structure.hasH1 ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {analysis.structure.hasH1 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">Has H1 Heading</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">Missing H1</span>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card className={`border ${analysis.structure.hasImages ? 'bg-emerald-900/20 border-emerald-800' : 'bg-amber-900/20 border-amber-800'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {analysis.structure.hasImages ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">Has Images</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400">No Images</span>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
