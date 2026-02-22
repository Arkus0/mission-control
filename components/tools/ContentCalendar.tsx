"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useCalendarEvents } from "@/hooks/useStorage"

const typeColors = {
  article: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  research: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  publish: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
}

const typeIcons = {
  article: "📝",
  research: "🔬",
  review: "👁️",
  publish: "🚀",
  other: "📌"
}

const statusIcons = {
  planned: Circle,
  "in-progress": Clock,
  completed: CheckCircle2,
  overdue: AlertCircle
}

const statusColors = {
  planned: "text-zinc-400",
  "in-progress": "text-blue-400",
  completed: "text-emerald-400",
  overdue: "text-red-400"
}

export function ContentCalendar() {
  const { events, addEvent, deleteEvent, cycleStatus } = useCalendarEvents()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    type: "article" as const,
    description: ""
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const handleAddEvent = () => {
    addEvent({
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type,
      description: newEvent.description
    })
    
    setNewEvent({ title: "", date: "", type: "article", description: "" })
    setIsAddOpen(false)
  }

  const upcomingEvents = [...events]
    .filter(e => e.status !== "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const completedThisMonth = events.filter(e => {
    const eventDate = new Date(e.date)
    return e.status === "completed" && eventDate.getMonth() === month && eventDate.getFullYear() === year
  }).length

  const totalPlanned = events.filter(e => e.status === "planned").length
  const inProgress = events.filter(e => e.status === "in-progress").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">This Month</p>
                <p className="text-2xl font-bold">{completedThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Planned</p>
                <p className="text-2xl font-bold">{totalPlanned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Circle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">In Progress</p>
                <p className="text-2xl font-bold">{inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Completed</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{monthName} {year}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 ml-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm text-zinc-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDate(day)
                const isToday = day === new Date().getDate() && 
                  month === new Date().getMonth() && 
                  year === new Date().getFullYear()
                
                return (
                  <div
                    key={day}
                    className={`aspect-square border border-zinc-800 rounded-lg p-1 overflow-hidden ${
                      isToday ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${typeColors[event.type]}`}
                        >
                          {typeIcons[event.type]} {event.title.slice(0, 15)}
                          {event.title.length > 15 && "..."}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-zinc-500 px-1.5">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming</CardTitle>
            <CardDescription>Next 5 scheduled items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => {
              const StatusIcon = statusIcons[event.status]
              return (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{typeIcons[event.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-zinc-500">{event.date}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${typeColors[event.type]}`}
                        >
                          {event.type}
                        </Badge>
                        
                        <button
                          onClick={() => cycleStatus(event.id)}
                          className={`flex items-center gap-1 text-xs ${statusColors[event.status]} hover:opacity-80`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {event.status}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {upcomingEvents.length === 0 && (
              <p className="text-center text-zinc-500 py-8">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <Badge variant="outline" className={colors}>
              {typeIcons[type as keyof typeof typeIcons]} {type}
            </Badge>
          </div>
        ))}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>Schedule a new content task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
              >
                <option value="article">📝 Article</option>
                <option value="research">🔬 Research</option>
                <option value="review">👁️ Review</option>
                <option value="publish">🚀 Publish</option>
                <option value="other">📌 Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                placeholder="Additional details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
