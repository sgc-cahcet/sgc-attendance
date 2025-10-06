"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // ✅ Check for active session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/admin/dashboard")
      }
    }
    checkSession()
  }, [router])

  // ✅ Login handler with role verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Step 1: Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const user = data.user
      if (!user) throw new Error("User not found")

      // Step 2: Check role from members table
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("role")
        .eq("email", email)
        .single()

      if (memberError) throw memberError
      if (!memberData) throw new Error("Member record not found")

      const allowedRoles = ["President", "Vice President", "Administrator"]

      if (!allowedRoles.includes(memberData.role)) {
        // Not authorized → sign out
        await supabase.auth.signOut()
        throw new Error("Unauthorized access. Only Board Members and Administrator can log in.")
      }

      // ✅ Authorized → redirect to dashboard
      router.push("/admin/dashboard")

    } catch (error: any) {
      setError(error.message || "Error logging in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md bg-white border-2 border-black rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="SGC Logo"
            width={100}
            height={100}
          />
        </div>

        <h1 className="text-4xl font-black mb-8 text-center tracking-tight">
          Admin Login
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-black text-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px]
                transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px]
                transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 
              border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              transition-all
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </main>

      <div className="mt-8 text-center text-gray-500 text-xs">
        <p>This Site was Developed and Maintained by SGC</p>
        <p>&copy; {new Date().getFullYear()} Students Guidance Cell - CAHCET. All Rights Reserved</p>
      </div>
    </div>
  )
}
