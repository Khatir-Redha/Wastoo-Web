"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthProvider" // Import the custom hook

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth() // Extract login from context

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setErrorMsg(null) // Clear any previous errors

    try {
      // Hit the login function from AuthProvider which handles the API call and setting tokens
      await login(email, password)
      
      // If successful, redirect to the dashboard
      router.push("/dashboard")
      
    } catch (error: any) {
      // Handle incorrect passwords or non-existent users
      const message = error.response?.data?.message || "Invalid email or password. Please try again."
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans overflow-x-hidden">
      
      {/* Left Panel: Brand Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-12 min-h-[409px] md:min-h-screen text-white overflow-hidden bg-[#1A3C2E]">
        <div 
          className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px]" />
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: "2s" }} 
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 relative">
              <Image 
                src="/recycle.svg" 
                alt="Wasto Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Wasto</h1>
          </div>
          <p className="text-lg text-white/60 max-w-[280px]">
            Turn waste into value
          </p>
        </div>

        <div className="hidden md:block absolute bottom-12 left-12 right-12">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-gray-300 overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgYEdh3gwoHD1szIECCnRGPNjvd8F1zd4DM2BlX3fcBEniU8AzN6WKAU2_o9snU5YF1HT6EojmgqCHNZJbc1x1qdOq_GlRsXXiP66hL_48jth3wH-9eDsjnNOwdIiZeFK9iV5Jz9FmNPll_8FS3MSdVyYHfygi4MDNvXYb8wREdmRjpu6qWQ0nWoQkDo4s2EhyGLjM5zgYgbzFlgGd0JnIDM9q6LwwoPFX2bWtcW_Bts33NF4YKz4Pb8BQEc420GE4OALBbPP1FE8" alt="User 1" className="w-full h-full object-cover"/>
               </div>
               <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-gray-400 overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG7nKUJ2dLoe4w0dERG1QzOJFYZjamf6GXmTSiZTktXrOHQhi1NiOcZ6jJERbgPReXEyJbZWYWSZnnHYb1FjJCjubM_uuc7o5ok_drCzs-B6krzOFekHJwJqGYzSDKdTCwXEZa_cwA0PD6Jt3HH6-nVFK-r_D2sgnCFyX8urNjSyp1eK8qMsVX9JOSrz1lu9SUOHRpSn46j75yaESn9KKnZejo9bF74wNOHMBlJlQCTDDiM5EwIJTNsxr2DXjcpSJcjuZcK1txR5c" alt="User 2" className="w-full h-full object-cover"/>
               </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                +12k
              </div>
            </div>
            <p className="text-xs text-white/40 font-medium">Trusted by 12,000+ businesses</p>
          </div>
        </div>
      </section>

      {/* Right Panel: Auth Form */}
      <section className="flex-1 bg-surface flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[400px]">
          
          <header className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </header>

          <form className="space-y-6" onSubmit={onSubmit}>
            
            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                className="h-10 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="h-10 rounded-xl pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label 
                  htmlFor="remember" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  Remember me
                </label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 rounded-xl font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 text-xs text-muted-foreground bg-surface px-2 uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              New to Wasto?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <footer className="absolute bottom-8 left-0 right-0 px-8 flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
          <span className="text-xs text-muted-foreground">© 2026 Wasto Recycling Exchange</span>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </section>
    </div>
  )
}