"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { LogOut, Users, CalendarCheck, BarChart3 } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // No active session, redirect to login
        router.replace('/admin/login')
        return
      }

      setUser(session.user)
    } catch (error) {
      console.error('Error checking session:', error)
      router.replace('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    )
  }

  // If we're not loading and there's no user, the useEffect will handle the redirect
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
      <Image 
          src={"/logo.png"}
          alt="SGC Logo"
          width={100}
          height={100}
        />
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Admin Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {user && (
            <p className="font-medium bg-white px-4 py-2 rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base w-full sm:w-auto text-center sm:text-left break-all">
              {user.email}
            </p>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto text-sm sm:text-base"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        <Link href="/admin/members" className="block">
          <Card className="p-4 sm:p-6 bg-yellow-100 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              <h3 className="text-xl sm:text-2xl font-bold">Manage Members</h3>
            </div>
            <p className="text-base sm:text-lg">Add, remove, or edit member information</p>
          </Card>
        </Link>

        <Link href="/admin/attendance" className="block">
          <Card className="p-4 sm:p-6 bg-blue-100 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8" />
              <h3 className="text-xl sm:text-2xl font-bold">Daily Attendance</h3>
            </div>
            <p className="text-base sm:text-lg">Enter daily attendance for members</p>
          </Card>
        </Link>

        <Link href="/admin/reports" className="block">
          <Card className="p-4 sm:p-6 bg-green-100 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
              <h3 className="text-xl sm:text-2xl font-bold">Reports</h3>
            </div>
            <p className="text-base sm:text-lg">View attendance reports and statistics</p>
          </Card>
        </Link>
      </div>
      {/* <div className="mt-8 text-center text-gray-500 text-xs">
        <p>This Site was Developed and Maintained by SGC</p>
          <p>&copy; {new Date().getFullYear()} Students Guidance Cell - CAHCET. All Rights Reserved</p>
        </div> */}
    </div>
  )
}