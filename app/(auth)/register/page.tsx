"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Leaf, Truck, Heart, Factory } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthProvider" // Assuming you export useAuth from AuthProvider
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth() // We will log them in immediately after registering
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("Citizen") // Default role

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      // 1. Hit the NestJS Register Endpoint
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role: selectedRole
      })
      console.log("Register request response : ", response)
      // 2. If successful, extract tokens (based on your auth.service.ts)
      if (response.data?.token) {
        // You can either call your context login function here to set state, 
        // or directly set tokens if your context auto-checks on mount.
        // For simplicity, we'll manually set tokens and let checkAuth handle the rest,
        // OR reuse the login method logic.
        localStorage.setItem("accessToken", response.data.token.accessToken)
        localStorage.setItem("refreshToken", response.data.token.refreshToken)
        
        // Force the app to re-read the token and update user state
        window.location.href = "/dashboard" 
      }
      
    } catch (error: any) {
      // Handle NestJS BadRequestException or other errors
      const message = error.response?.data?.message || "An error occurred during registration. Please try again."
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans overflow-x-hidden">
      
      {/* Left Panel: Brand Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-16 min-h-[409px] md:min-h-screen text-white overflow-hidden bg-[#1A3C2E]">
        <div 
          className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px]" />
        
        {/* Animated Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#b1f800] opacity-10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: "2s" }} 
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 relative">
               <Image 
                  src="/recycle.svg" 
                  alt="Wasto Logo" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 object-contain"
                />
            </div>
            <h1 className="text-5xl font-bold tracking-tight font-heading">Wasto</h1>
          </div>
          <p className="text-xl text-white/70 max-w-[300px]">
            Turn waste into value
          </p>
        </div>

        {/* Hero Decorative Elements */}
        <div className="hidden md:block absolute bottom-12 left-12 right-12">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-[#1A3C2E] bg-gray-300 overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgYEdh3gwoHD1szIECCnRGPNjvd8F1zd4DM2BlX3fcBEniU8AzN6WKAU2_o9snU5YF1HT6EojmgqCHNZJbc1x1qdOq_GlRsXXiP66hL_48jth3wH-9eDsjnNOwdIiZeFK9iV5Jz9FmNPll_8FS3MSdVyYHfygi4MDNvXYb8wREdmRjpu6qWQ0nWoQkDo4s2EhyGLjM5zgYgbzFlgGd0JnIDM9q6LwwoPFX2bWtcW_Bts33NF4YKz4Pb8BQEc420GE4OALBbPP1FE8" alt="User 1" className="w-full h-full object-cover"/>
               </div>
               <div className="w-10 h-10 rounded-full border-2 border-[#1A3C2E] bg-gray-400 overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG7nKUJ2dLoe4w0dERG1QzOJFYZjamf6GXmTSiZTktXrOHQhi1NiOcZ6jJERbgPReXEyJbZWYWSZnnHYb1FjJCjubM_uuc7o5ok_drCzs-B6krzOFekHJwJqGYzSDKdTCwXEZa_cwA0PD6Jt3HH6-nVFK-r_D2sgnCFyX8urNjSyp1eK8qMsVX9JOSrz1lu9SUOHRpSn46j75yaESn9KKnZejo9bF74wNOHMBlJlQCTDDiM5EwIJTNsxr2DXjcpSJcjuZcK1txR5c" alt="User 2" className="w-full h-full object-cover"/>
               </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#1A3C2E] bg-primary flex items-center justify-center text-xs font-bold text-white">
                +12k
              </div>
            </div>
            <p className="text-sm text-white/50 font-medium">Trusted by 12,000+ businesses</p>
          </div>
        </div>
      </section>

      {/* Right Panel: Auth Form */}
      <section className="flex-1 bg-surface flex flex-col items-center justify-center p-8 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto pt-12 pb-24">
          
          {/* Header */}
          <header className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground tracking-tight font-heading mb-2">Create your account</h2>
            <p className="text-base text-muted-foreground">Join the circular economy</p>
          </header>

          {/* Form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            
            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-muted-foreground font-medium">Full name</Label>
              <Input 
                id="fullname" 
                type="text" 
                placeholder="Karim Benali" 
                required 
                className="h-12 rounded-xl text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground font-medium">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                className="h-12 rounded-xl text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground font-medium">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min. 8 characters" 
                  required 
                  className="h-12 rounded-xl text-base pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-muted-foreground font-medium">Confirm password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className={`h-12 rounded-xl text-base pr-12 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection Grid */}
            <div className="space-y-3 pt-2">
              <Label className="text-muted-foreground font-medium block">I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedRole('Citizen')}
                  className={`flex items-center space-x-2 p-3 border rounded-xl transition-all text-sm font-medium ${selectedRole === 'Citizen' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary text-foreground'}`}
                >
                  <Leaf className={`w-5 h-5 ${selectedRole === 'Citizen' ? 'text-primary' : 'text-primary/70'}`} />
                  <span>Citizen</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedRole('Collector')}
                  className={`flex items-center space-x-2 p-3 border rounded-xl transition-all text-sm font-medium ${selectedRole === 'Collector' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary text-foreground'}`}
                >
                  <Truck className={`w-5 h-5 ${selectedRole === 'Collector' ? 'text-primary' : 'text-primary/70'}`} />
                  <span>Collector</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedRole('Charity')}
                  className={`flex items-center space-x-2 p-3 border rounded-xl transition-all text-sm font-medium ${selectedRole === 'Charity' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary text-foreground'}`}
                >
                  <Heart className={`w-5 h-5 ${selectedRole === 'Charity' ? 'text-primary' : 'text-primary/70'}`} />
                  <span>Charity</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedRole('Recycling Centre')}
                  className={`flex items-center space-x-2 p-3 border rounded-xl transition-all text-sm font-medium ${selectedRole === 'Recycling Centre' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary text-foreground'}`}
                >
                  <Factory className={`w-5 h-5 ${selectedRole === 'Recycling Centre' ? 'text-primary' : 'text-primary/70'}`} />
                  <span>Recycling Centre</span>
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm font-medium text-muted-foreground leading-snug cursor-pointer">
                I agree to the <Link href="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base mt-4" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 text-sm text-muted-foreground bg-surface px-3 uppercase tracking-wider font-medium">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <p className="text-center text-base text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Secondary Legal Footer */}
        <footer className="absolute bottom-6 left-0 right-0 px-8 flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-8 bg-surface">
          <span className="text-sm text-muted-foreground">© 2026 Wasto Recycling Exchange</span>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </section>
    </div>
  )
}