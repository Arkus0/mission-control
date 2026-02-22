"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  useSensor, 
  useSensors, 
  PointerSensor,
  closestCorners
} from "@dnd-kit/core"
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Bot, 
  BookOpen, 
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit,
  Link2,
  Clock
} from "lucide-react"
import { useLocalStorage } from "@/hooks/useStorage"
import { useArticles } from "@/hooks/useStorage"
import { useResearchSources } from "@/hooks/useStorage"
import { usePrompts } from "@/hooks/useStorage"
import { useCalendarEvents } from "@/hooks/useStorage"

type TaskStatus = 'ideas' | 'research' | 'draft' | 'review' | 'published'

interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  articleId?: string
  researchCount: number
  promptsUsed: string[]
  cost: number
  dueDate?: string
  tags: string[]
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'ideas', title: '💡 Ideas', color: 'bg-zinc-800' },
  { id: 'research', title: '🔬 Research', color: 'bg-blue-900/30' },
  { id: 'draft', title: '📝 Draft', color: 'bg-amber-900/30' },
  { id: 'review', title: '👁️ Review', color: 'bg-purple-900/30' },
  { id: 'published', title: '🚀 Published', color: 'bg-emerald-900/30' },
]

const PRIORITY_COLORS = {
  low: 'bg-zinc-600',
  medium: 'bg-amber-500',
  high: 'bg-red-500'
}

// Sortable Task Card Component
function TaskCard({ 
  task, 
  onDelete, 
  onEdit 
}: { 
  task: Task
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
        <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]} flex-shrink-0 mt-1`} />
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {task.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
        {task.researchCount > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {task.researchCount}
          </span>
        )}
        {task.promptsUsed.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {task.promptsUsed.length}
          </span>
        )}
        {task.cost > 0 && (
          <span className="flex items-center gap-1 text-emerald-400">
            <DollarSign className="w-3 h-3" />
            ${task.cost.toFixed(2)}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(task.id)}>
          <Trash2 className="w-3 h-3 text-red-400" />
        </Button>
      </div>
    </div>
  )
}

export function TaskBoard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('mission-control-tasks', [])
  const { articles } = useArticles()
  const { sources } = useResearchSources()
  const { prompts } = usePrompts()
  const { events } = useCalendarEvents()
  
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const [newTask, setNewTask] = useState<{
    title: string
    priority: 'low' | 'medium' | 'high'
    dueDate: string
    tags: string
  }>({
    title: "",
    priority: "medium",
    dueDate: "",
    tags: ""
  })

  // Sync with existing data
  const syncedTasks = useMemo(() => {
    // Create tasks from articles that don't have one
    const articleTasks: Task[] = articles
      .filter(a => !tasks.some(t => t.articleId === a.id))
      .map(a => ({
        id: `article-${a.id}`,
        title: a.title,
        status: (a.status === 'published' ? 'published' : 
                a.status === 'approved' ? 'review' :
                a.status === 'review' ? 'review' : 'draft') as TaskStatus,
        priority: 'medium' as const,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        articleId: a.id,
        researchCount: sources.filter(s => s.articleId === a.id).length,
        promptsUsed: [],
        cost: a.cost,
        tags: a.models
      }))

    // Create tasks from calendar events
    const eventTasks: Task[] = events
      .filter(e => !tasks.some(t => t.title === e.title) && !articles.some(a => a.title === e.title))
      .map(e => ({
        id: `event-${e.id}`,
        title: e.title,
        status: (e.type === 'publish' ? 'published' :
                e.type === 'review' ? 'review' :
                e.type === 'article' ? 'draft' :
                e.type === 'research' ? 'research' : 'ideas') as TaskStatus,
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        researchCount: 0,
        promptsUsed: [],
        cost: 0,
        dueDate: e.date,
        tags: [e.type]
      }))

    return [...tasks, ...articleTasks, ...eventTasks]
  }, [tasks, articles, sources, events])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = syncedTasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Check if dropped on a column
    const columnId = over.id as TaskStatus
    if (COLUMNS.some(c => c.id === columnId)) {
      if (activeTask.status !== columnId) {
        updateTaskStatus(activeTask.id, columnId)
      }
      return
    }

    // Check if dropped on another task
    const overTask = syncedTasks.find(t => t.id === over.id)
    if (overTask && activeTask.status === overTask.status) {
      // Reorder within same column
      const oldIndex = syncedTasks.findIndex(t => t.id === active.id)
      const newIndex = syncedTasks.findIndex(t => t.id === over.id)
      setTasks(arrayMove(syncedTasks, oldIndex, newIndex))
    }
  }

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ))
  }

  const handleAddTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      status: 'ideas',
      priority: newTask.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      researchCount: 0,
      promptsUsed: [],
      cost: 0,
      dueDate: newTask.dueDate || undefined,
      tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    
    setTasks(prev => [task, ...prev])
    setNewTask({ title: "", priority: "medium", dueDate: "", tags: "" })
    setIsCreateOpen(false)
  }

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate || "",
      tags: task.tags.join(', ')
    })
    setIsCreateOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingTask) return
    
    setTasks(prev => prev.map(t => 
      t.id === editingTask.id 
        ? { 
            ...t, 
            title: newTask.title,
            priority: newTask.priority,
            dueDate: newTask.dueDate || undefined,
            tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean),
            updatedAt: new Date().toISOString()
          }
        : t
    ))
    
    setEditingTask(null)
    setNewTask({ title: "", priority: "medium", dueDate: "", tags: "" })
    setIsCreateOpen(false)
  }

  const tasksByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = syncedTasks.filter(t => t.status === col.id)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
  }, [syncedTasks])

  const stats = {
    total: syncedTasks.length,
    ideas: tasksByColumn.ideas.length,
    research: tasksByColumn.research.length,
    draft: tasksByColumn.draft.length,
    review: tasksByColumn.review.length,
    published: tasksByColumn.published.length,
    totalCost: syncedTasks.reduce((sum, t) => sum + t.cost, 0)
  }

  const activeTask = activeId ? syncedTasks.find(t => t.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {COLUMNS.map(col => (
          <Card key={col.id} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase">{col.title}</p>
              <p className="text-2xl font-bold">{tasksByColumn[col.id]?.length || 0}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase">Total Cost</p>
            <p className="text-2xl font-bold text-emerald-400">${stats.totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} rounded-t-lg p-3 border border-zinc-700 border-b-0`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{column.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {tasksByColumn[column.id]?.length || 0}
                  </Badge>
                </div>
              </div>
              
              <div 
                className="flex-1 bg-zinc-950/30 rounded-b-lg p-2 border border-zinc-700 min-h-[400px]"
                data-column={column.id}
              >
                <SortableContext
                  items={tasksByColumn[column.id]?.map(t => t.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {tasksByColumn[column.id]?.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onDelete={() => {}}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update task details." : "Add a new task to your board."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
              <Input
                placeholder="philosophy, ai, draft"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false)
              setEditingTask(null)
              setNewTask({ title: "", priority: "medium", dueDate: "", tags: "" })
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingTask ? handleSaveEdit : handleAddTask}
              disabled={!newTask.title}
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
