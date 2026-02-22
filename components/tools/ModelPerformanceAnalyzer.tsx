"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts"
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star,
  Zap,
  Target,
  Brain
} from "lucide-react"

interface ModelPerformance {
  model: string
  provider: string
  tasks: {
    writing: number
    research: number
    coding: number
    analysis: number
    creativity: number
  }
  avgCost: number
  avgSpeed: number // tokens per second
  reliability: number // 0-100
  usageCount: number
}

const mockPerformance: ModelPerformance[] = [
  {
    model: "Claude Opus 4.5",
    provider: "OpenRouter",
    tasks: { writing: 95, research: 90, coding: 85, analysis: 92, creativity: 94 },
    avgCost: 0.032,
    avgSpeed: 45,
    reliability: 98,
    usageCount: 24
  },
  {
    model: "Kimi K2.5",
    provider: "OpenClaw",
    tasks: { writing: 85, research: 80, coding: 88, analysis: 85, creativity: 82 },
    avgCost: 0.005,
    avgSpeed: 120,
    reliability: 96,
    usageCount: 42
  },
  {
    model: "Perplexity Sonar",
    provider: "OpenRouter",
    tasks: { writing: 75, research: 98, coding: 60, analysis: 88, creativity: 70 },
    avgCost: 0.008,
    avgSpeed: 80,
    reliability: 94,
    usageCount: 18
  },
  {
    model: "GPT-4o-mini",
    provider: "OpenRouter",
    tasks: { writing: 80, research: 75, coding: 82, analysis: 78, creativity: 80 },
    avgCost: 0.002,
    avgSpeed: 200,
    reliability: 95,
    usageCount: 35
  },
  {
    model: "Claude 3.5 Sonnet",
    provider: "OpenRouter",
    tasks: { writing: 88, research: 85, coding: 90, analysis: 87, creativity: 86 },
    avgCost: 0.012,
    avgSpeed: 85,
    reliability: 97,
    usageCount: 31
  }
]

const COLORS = {
  "Claude Opus 4.5": "#8b5cf6",
  "Kimi K2.5": "#3b82f6",
  "Perplexity Sonar": "#10b981",
  "GPT-4o-mini": "#f59e0b",
  "Claude 3.5 Sonnet": "#ec4899"
}

export function ModelPerformanceAnalyzer() {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    mockPerformance.map(m => m.model)
  )

  const filteredData = useMemo(() => 
    mockPerformance.filter(m => selectedModels.includes(m.model)),
    [selectedModels]
  )

  const radarData = useMemo(() => {
    const tasks = ["writing", "research", "coding", "analysis", "creativity"]
    return tasks.map(task => {
      const entry: Record<string, string | number> = { task: task.charAt(0).toUpperCase() + task.slice(1) }
      filteredData.forEach(m => {
        entry[m.model] = m.tasks[task as keyof typeof m.tasks]
      })
      return entry
    })
  }, [filteredData])

  const costData = useMemo(() => 
    filteredData.map(m => ({
      model: m.model.split(" ")[0],
      fullName: m.model,
      cost: m.avgCost,
      speed: m.avgSpeed
    })),
    [filteredData]
  )

  const bestWriter = mockPerformance.reduce((best, m) => 
    m.tasks.writing > best.tasks.writing ? m : best
  )
  const bestResearcher = mockPerformance.reduce((best, m) => 
    m.tasks.research > best.tasks.research ? m : best
  )
  const mostReliable = mockPerformance.reduce((best, m) => 
    m.reliability > best.reliability ? m : best
  )
  const cheapest = mockPerformance.reduce((best, m) => 
    m.avgCost < best.avgCost ? m : best
  )

  const toggleModel = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    )
  }

  return (
    <div className="space-y-6">
      {/* Champion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zinc-400">Best Writer</p>
                <p className="font-semibold truncate">{bestWriter.model}</p>
                <p className="text-xs text-purple-400">{bestWriter.tasks.writing}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <Brain className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zinc-400">Best Researcher</p>
                <p className="font-semibold truncate">{bestResearcher.model}</p>
                <p className="text-xs text-emerald-400">{bestResearcher.tasks.research}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zinc-400">Most Reliable</p>
                <p className="font-semibold truncate">{mostReliable.model}</p>
                <p className="text-xs text-blue-400">{mostReliable.reliability}%</p>
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
              <div className="min-w-0">
                <p className="text-sm text-zinc-400">Most Economical</p>
                <p className="font-semibold truncate">{cheapest.model}</p>
                <p className="text-xs text-amber-400">${cheapest.avgCost.toFixed(3)}/call</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Selector */}
      <div className="flex flex-wrap gap-2">
        {mockPerformance.map((m) => (
          <Badge
            key={m.model}
            variant={selectedModels.includes(m.model) ? "default" : "outline"}
            className="cursor-pointer gap-2"
            style={{
              backgroundColor: selectedModels.includes(m.model) 
                ? COLORS[m.model as keyof typeof COLORS] 
                : undefined,
              borderColor: COLORS[m.model as keyof typeof COLORS]
            }}
            onClick={() => toggleModel(m.model)}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: COLORS[m.model as keyof typeof COLORS] }}
            />
            {m.model}
          </Badge>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="radar" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="radar">Task Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost vs Speed</TabsTrigger>
          <TabsTrigger value="details">Model Details</TabsTrigger>
        </TabsList>

        <TabsContent value="radar" className="mt-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Performance by Task Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="task" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    {filteredData.map((m) => (
                      <Radar
                        key={m.model}
                        name={m.model}
                        dataKey={m.model}
                        stroke={COLORS[m.model as keyof typeof COLORS]}
                        fill={COLORS[m.model as keyof typeof COLORS]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="mt-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Cost vs Speed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="model" stroke="#71717a" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#71717a" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="cost" 
                      name="Avg Cost ($)" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="speed" 
                      name="Speed (tok/s)" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-sm text-zinc-400">Avg Cost ($)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-sm text-zinc-400">Speed (tokens/sec)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="grid gap-4">
            {filteredData.map((m) => (
              <Card key={m.model} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{m.model}</h3>
                        <Badge variant="outline">{m.provider}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {Object.entries(m.tasks).map(([task, score]) => (
                          <div key={task} className="text-center">
                            <p className="text-xs text-zinc-500 uppercase">{task}</p>
                            <div className="mt-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${score}%`,
                                  backgroundColor: COLORS[m.model as keyof typeof COLORS]
                                }}
                              />
                            </div>
                            <p className="text-sm font-medium mt-1">{score}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-xs text-zinc-500">Avg Cost</p>
                        <p className="font-mono text-emerald-400">${m.avgCost.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Speed</p>
                        <p className="font-mono text-blue-400">{m.avgSpeed} tok/s</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Reliability</p>
                        <p className="font-mono text-purple-400">{m.reliability}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Uses</p>
                        <p className="font-mono">{m.usageCount}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
