"use client"

import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function MemberView() {
  const [memberData, setMemberData] = useState<any>(null)
  const [searchType, setSearchType] = useState<'email' | 'mobile'>('email')
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchMemberData = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMemberData(null)

    try {
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("*")
        .eq(searchType, searchValue)
        .single()

      if (memberError || !memberData) {
        setError("Member not found. Please check your details and try again.")
        setLoading(false)
        return
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberData.id)

      if (attendanceError) {
        setError("Error fetching attendance data. Please try again later.")
        setLoading(false)
        return
      }

      const totalDays = attendanceData.length
      const presentDays = attendanceData.filter((record: any) => record.is_present).length
      const absentDays = totalDays - presentDays
      const attendancePercentage = totalDays ? (presentDays / totalDays) * 100 : 0
      
      const absentDates = attendanceData
        .filter((record: any) => !record.is_present)
        .map((record: any) => new Date(record.date).toLocaleDateString())
        .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())

      setMemberData({
        ...memberData,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage,
        absentDates
      })
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.")
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-2 sm:p-4 md:p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
      <Image 
        src="/logo.png"
        alt="SGC Logo"
        fill
        className="object-contain"
        priority
      />
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6 tracking-tight">
          Member Attendance View
        </h2>

        <form onSubmit={fetchMemberData} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearchType('email')}
              className={`w-1/2 py-2 px-4 border-2 border-black rounded-lg text-center transition-transform hover:-translate-y-0.5 ${
                searchType === 'email' 
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Search by Email
            </button>
            <button
              type="button"
              onClick={() => setSearchType('mobile')}
              className={`w-1/2 py-2 px-4 border-2 border-black rounded-lg text-center transition-transform hover:-translate-y-0.5 ${
                searchType === 'mobile' 
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              Search by Phone
            </button>
          </div>

          <input
            type={searchType === 'email' ? 'email' : 'tel'}
            placeholder={searchType === 'email' ? 'Enter email address' : 'Enter phone number'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full py-2 px-4 border-2 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-black text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'View Attendance'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {memberData && (
          <div className="mt-8 space-y-6">
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="text-lg sm:text-xl font-black mb-4">Member Information</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y-2 divide-black">
                  <tr><td className="py-2 font-bold">Name:</td><td>{memberData.name}</td></tr>
                  <tr><td className="py-2 font-bold">Department:</td><td>{memberData.department}</td></tr>
                  <tr><td className="py-2 font-bold">Role:</td><td>{memberData.role}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <h3 className="text-lg sm:text-xl font-black mb-4">Attendance Summary</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y-2 divide-black">
                  <tr><td className="py-2 font-bold">Total Working Days:</td><td>{memberData.totalDays}</td></tr>
                  <tr><td className="py-2 font-bold">Present Days:</td><td>{memberData.presentDays}</td></tr>
                  <tr><td className="py-2 font-bold">Absent Days:</td><td>{memberData.absentDays}</td></tr>
                  <tr>
                    <td className="py-2 font-bold">Attendance Percentage:</td>
                    <td>
                      <span className={`inline-flex px-2 py-1 rounded-md border-2 border-black ${
                        memberData.attendancePercentage < 75 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {memberData.attendancePercentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {memberData.absentDates.length > 0 && (
              <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <h3 className="text-lg sm:text-xl font-black mb-4">Absence Dates (MM/DD/YYYY)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {memberData.absentDates.map((date: string, index: number) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 border-2 border-black rounded-lg p-2 text-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memberData.attendancePercentage < 75 && (
              <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-red-700 font-medium shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                ⚠️ Attendance Alert: Your attendance is below 75%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}