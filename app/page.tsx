"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContentPipeline } from "@/components/tools/ContentPipeline"
import { ApiCostTracker } from "@/components/tools/ApiCostTracker"
import { PromptLibrary } from "@/components/tools/PromptLibrary"
import { ResearchDashboard } from "@/components/tools/ResearchDashboard"
import { ModelPerformanceAnalyzer } from "@/components/tools/ModelPerformanceAnalyzer"
import { ContentCalendar } from "@/components/tools/ContentCalendar"
import { TaskBoard } from "@/components/tools/TaskBoard"
import { SEOAnalyzer } from "@/components/tools/SEOAnalyzer"
import { LoginScreen } from "@/components/LoginScreen"
import { ApiConfig } from "@/components/tools/ApiConfig"
import { isLoggedIn, logout, setApiKeys } from "@/lib/config"
import { 
  Terminal, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Activity,
  Cpu,
  Clock,
  BookOpen,
  BarChart3,
  Calendar,
  Kanban,
  Search,
  Settings,
  LogOut
} from "lucide-react"

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [authenticated, setAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check auth on mount
  useEffect(() => {
    setMounted(true)
    setAuthenticated(isLoggedIn())
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setAuthenticated(true)
  }

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const tools = [
    {
      id: "board",
      name: "Task Board",
      description: "Kanban workflow for content creation",
      icon: Kanban,
      component: TaskBoard,
      status: "active"
    },
    {
      id: "seo",
      name: "SEO Analyzer",
      description: "Optimize articles for search engines",
      icon: Search,
      component: SEOAnalyzer,
      status: "active"
    },
    {
      id: "content",
      name: "Content Pipeline",
      description: "Manage articles from draft to publication",
      icon: FileText,
      component: ContentPipeline,
      status: "active"
    },
    {
      id: "costs",
      name: "API Cost Tracker",
      description: "Monitor AI API usage and spending",
      icon: DollarSign,
      component: ApiCostTracker,
      status: "active"
    },
    {
      id: "prompts",
      name: "Prompt Library",
      description: "Store and organize your best prompts",
      icon: MessageSquare,
      component: PromptLibrary,
      status: "active"
    },
    {
      id: "research",
      name: "Research Dashboard",
      description: "Aggregate and organize research sources",
      icon: BookOpen,
      component: ResearchDashboard,
      status: "active"
    },
    {
      id: "models",
      name: "Model Performance",
      description: "Compare AI model effectiveness",
      icon: BarChart3,
      component: ModelPerformanceAnalyzer,
      status: "active"
    },
    {
      id: "calendar",
      name: "Content Calendar",
      description: "Schedule and plan publishing",
      icon: Calendar,
      component: ContentCalendar,
      status: "active"
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Terminal className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">MISSION CONTROL</h1>
                <p className="text-xs text-zinc-500">JuanBlog Operations Center</p>
              </div>
            </div>            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
                ONLINE
              </Badge>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            {tools.map(tool => (
              <TabsTrigger key={tool.id} value={tool.id} className="gap-2">
                <tool.icon className="w-4 h-4" />
                {tool.name}
              </TabsTrigger>
            ))}
            <TabsTrigger value="config" className="gap-2">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(tool => (
                <Card 
                  key={tool.id}
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => setActiveTab(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-zinc-800">
                        <tool.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={tool.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }
                      >
                        {tool.status.toUpperCase()}
                      </Badge>
                    </div>                    
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
                    </div>                  
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-zinc-900/30 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">System Status</h3>
                </div>                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-950/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">API Status</p>
                    <p className="text-sm font-medium text-emerald-400 mt-1">All Systems Operational</p>
                  </div>                  
                  <div className="p-4 rounded-lg bg-zinc-950/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">OpenRouter</p>
                    <p className="text-sm font-medium text-emerald-400 mt-1">Connected</p>
                  </div>                  
                  <div className="p-4 rounded-lg bg-zinc-950/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">GitHub</p>
                    <p className="text-sm font-medium text-emerald-400 mt-1">Synced</p>
                  </div>                  
                  <div className="p-4 rounded-lg bg-zinc-950/50">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Tools Active</p>
                    <p className="text-sm font-medium text-zinc-300 mt-1">{tools.length} Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {tools.map(tool => (
            <TabsContent key={tool.id} value={tool.id}>
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <tool.icon className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-2xl font-bold">{tool.name}</h2>
                    <p className="text-zinc-400">{tool.description}</p>
                  </div>
                </div>
              </div>              
              <tool.component />
            </TabsContent>
          ))}
          
          <TabsContent value="config">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold">Configuration</h2>
                  <p className="text-zinc-400">Connect your API keys for live data</p>
                </div>
              </div>
            </div>
            <ApiConfig />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
