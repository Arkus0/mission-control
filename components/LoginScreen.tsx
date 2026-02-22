"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login, isLoggedIn, logout } from "@/lib/config"
import { Terminal, Lock, Eye, EyeOff } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted", { username, password })
    setError("")
    setIsLoading(true)

    // Small delay to prevent brute force
    setTimeout(() => {
      const result = login(username, password)
      console.log("Login result:", result)
      if (result) {
        onLogin()
      } else {
        setError("Invalid credentials")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Terminal className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">MISSION CONTROL</CardTitle>
          <CardDescription>JuanBlog Operations Center</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-500" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                "Authenticating..."
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
