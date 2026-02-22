"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { DollarSign, TrendingUp, Zap, Activity, RefreshCw, Trash2, Wallet } from "lucide-react"
import { useApiUsage } from "@/hooks/useStorage"
import { openRouter } from "@/lib/openrouter"

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

export function ApiCostTracker() {
  const { usage, clearUsage, stats } = useApiUsage()
  const [credits, setCredits] = useState<{ credits: number; usage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Fetch OpenRouter credits on mount
  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    setIsLoading(true)
    try {
      const creditsData = await openRouter.getCredits()
      if (creditsData) {
        setCredits(creditsData)
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const modelChartData = useMemo(() => {
    const breakdown = usage.reduce((acc, u) => {
      acc[u.model] = (acc[u.model] || 0) + u.cost
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(4)) }))
      .sort((a, b) => b.value - a.value)
  }, [usage])

  const dailyChartData = useMemo(() => {
    const dailyCosts = usage.reduce((acc, u) => {
      const date = new Date(u.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + u.cost
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(dailyCosts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, cost]) => ({
        date: date.slice(5),
        cost: Number(cost.toFixed(3))
      }))
  }, [usage])

  const recentUsage = useMemo(() => 
    [...usage].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50),
    [usage]
  )

  return (
    <div className="space-y-6">
      {/* Credits Card */}
      {credits && (
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">OpenRouter Balance</p>
                  <p className="text-3xl font-bold">${credits.credits.toFixed(2)}</p>
                  <p className="text-sm text-zinc-500">
                    Used this month: ${credits.usage.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastSync && (
                  <p className="text-sm text-zinc-500">
                    Synced: {lastSync.toLocaleTimeString()}
                  </p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCredits}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Tokens</p>
                <p className="text-2xl font-bold">{(stats.totalTokens / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Avg/Call</p>
                <p className="text-2xl font-bold">${stats.avgCost.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">API Calls</p>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="daily">Daily Costs</TabsTrigger>
          <TabsTrigger value="models">Model Breakdown</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Daily API Costs (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyChartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                        itemStyle={{ color: '#e4e4e7' }}
                      />
                      <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No data yet. API calls will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models" className="mt-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Cost by Model</CardTitle>
            </CardHeader>
            <CardContent>
              {modelChartData.length > 0 ? (
                <>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modelChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {modelChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                          itemStyle={{ color: '#e4e4e7' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>              
                  <div className="flex flex-wrap gap-4 justify-center mt-4">
                    {modelChartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-zinc-400">{entry.name}: ${entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No data yet. API calls will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent API Calls</CardTitle>
              {usage.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearUsage}
                  className="gap-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {recentUsage.length > 0 ? (
                <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
                  {recentUsage.map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {u.provider}
                        </Badge>
                        <span className="font-medium">{u.model}</span>
                        <span className="text-sm text-zinc-500">
                          {new Date(u.timestamp).toLocaleString()}
                        </span>
                      </div>                    
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">{(u.tokens / 1000).toFixed(1)}k tokens</span>
                        <span className="font-mono font-medium text-emerald-400">${u.cost.toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500">
                  No API calls recorded yet.
                  <br />
                  <span className="text-sm">Usage will be tracked automatically when you make API calls.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
