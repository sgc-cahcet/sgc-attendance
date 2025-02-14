"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { ArrowLeft, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Feedback {
  id: number
  created_at: string
  name: string
  email: string
  feedback_type: string
  message: string
  status: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const router = useRouter()

  const statusOptions = ["pending", "in-progress", "resolved", "rejected"]

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/admin/login')
        return
      }

      setUser(session.user)
      fetchFeedbacks()
    } catch (error) {
      console.error('Error checking session:', error)
      router.replace('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error fetching feedback:", error)
    else setFeedbacks(data || [])
  }

  const updateFeedbackStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("feedback")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      console.error("Error updating feedback status:", error)
      alert("Failed to update status. Please try again.")
    } else {
      fetchFeedbacks()
    }
  }

  const deleteFeedback = async (id: number) => {
    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting feedback:", error)
      alert("Failed to delete feedback. Please try again.")
    } else {
      setDeleteConfirm(null)
      fetchFeedbacks()
    }
  }

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const searchLower = searchQuery.toLowerCase()
      return (
        feedback.name.toLowerCase().includes(searchLower) ||
        feedback.email.toLowerCase().includes(searchLower) ||
        feedback.feedback_type.toLowerCase().includes(searchLower) ||
        feedback.message.toLowerCase().includes(searchLower) ||
        feedback.status.toLowerCase().includes(searchLower)
      )
    })
  }, [feedbacks, searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Loading...
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
          <Link 
            href="/admin/dashboard" 
            className="inline-flex items-center bg-white text-gray-800 font-semibold px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="hidden md:block"
            />
            <h1 className="text-2xl md:text-3xl font-bold">Feedback Management</h1>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search feedbacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-black focus:outline-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
        </div>

        {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {/* Header with Name, Email, and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[60%]"> {/* Limit width of name/email section */}
                    <h3 className="font-semibold text-lg truncate">{feedback.name}</h3>
                    <p className="text-gray-600 text-sm truncate">{feedback.email}</p>
                  </div>
                  
                  {/* Status and Delete - Always in top right */}
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <select
                      value={feedback.status}
                      onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                      className={`w-full px-2 py-1 border rounded font-medium text-sm ${
                        statusColors[feedback.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setDeleteConfirm(feedback.id)}
                      className="w-full flex items-center justify-center px-2 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Type and Date */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 font-medium text-sm">
                    {feedback.feedback_type}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {formatDate(feedback.created_at)} at {formatTime(feedback.created_at)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-gray-800 border-l-4 border-gray-200 pl-3 text-sm">
                  {feedback.message}
                </p>
              </div>
            ))}
          </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden md:block bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Date/Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Type</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Message</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((feedback, idx) => (
                  <tr key={feedback.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatDate(feedback.created_at)}<br/>
                      {formatTime(feedback.created_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-800">{feedback.name}</td>
                    <td className="px-6 py-4 text-gray-600">{feedback.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 font-medium">
                        {feedback.feedback_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {feedback.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={feedback.status}
                        onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                        className={`px-3 py-1.5 border rounded font-medium ${statusColors[feedback.status as keyof typeof statusColors]}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteConfirm(feedback.id)}
                        className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black p-6 max-w-sm w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this feedback? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm && deleteFeedback(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 border border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}