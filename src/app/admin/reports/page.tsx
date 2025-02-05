"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import AttendanceBarChart from "@/components/BarChart"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Member {
  name: string
  department: string
  role: string
}

interface AttendanceRecord {
  is_present: boolean
  date: string
  members: Member
}

interface MonthlyAttendance {
  name: string
  department: string
  role: string
  workingDays: number
  present: number
  absent: number
  attendancePercentage: number
  absentDates: string[]
}

interface MonthlyReport {
  [key: string]: MonthlyAttendance
}

export default function Reports() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("")
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
        router.replace('/admin/login')
        return
      }

      setUser(session.user)
      fetchAttendanceData()
    } catch (error) {
      console.error('Error checking session:', error)
      router.replace('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceData = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        members (name, department, role)
      `)
    if (error) {
      console.error("Error fetching attendance data:", error)
      return
    }
    
    setAttendanceData(data || [])
    processAvailableMonths(data)
    processChartData(data)
  }

  const processAvailableMonths = (data: AttendanceRecord[]) => {
    const months = new Set(
      data.map(record => {
        const date = new Date(record.date)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      })
    )
    const sortedMonths = Array.from(months).sort()
    setAvailableMonths(sortedMonths)
    setSelectedMonth(sortedMonths[sortedMonths.length - 1] || "")
  }

  const processChartData = (data: AttendanceRecord[]) => {
    if (!selectedMonth) return

    const filteredData = data.filter(record => {
      const recordDate = new Date(record.date)
      const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
      return recordMonth === selectedMonth
    })

    const memberAttendance: { [key: string]: { present: number; absent: number } } = {}

    filteredData.forEach((record) => {
      const memberName = record.members.name
      if (!memberAttendance[memberName]) {
        memberAttendance[memberName] = { present: 0, absent: 0 }
      }
      if (record.is_present) {
        memberAttendance[memberName].present++
      } else {
        memberAttendance[memberName].absent++
      }
    })

    const processedData = Object.entries(memberAttendance).map(([name, record]) => ({
      name,
      present: record.present,
      absent: record.absent
    }))

    setChartData(processedData)
  }

  const getMonthlyAttendanceReport = (): MonthlyReport => {
    if (!selectedMonth) return {}

    const [year, month] = selectedMonth.split('-').map(Number)
    
    // Get all attendance records for the selected month
    const monthlyRecords = attendanceData.filter(record => {
      const recordDate = new Date(record.date)
      const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
      return recordMonth === selectedMonth
    })

    // Get unique dates where attendance was marked
    const workingDays = new Set(monthlyRecords.map(record => record.date)).size

    const report: MonthlyReport = {}

    // Initialize report for all members
    const uniqueMembers = new Set(monthlyRecords.map(record => record.members.name))
    uniqueMembers.forEach(memberName => {
      const memberRecord = monthlyRecords.find(record => record.members.name === memberName)
      if (memberRecord) {
        report[memberName] = {
          name: memberName,
          department: memberRecord.members.department,
          role: memberRecord.members.role,
          workingDays: workingDays, // Use actual working days
          present: 0,
          absent: 0,
          attendancePercentage: 0,
          absentDates: []
        }
      }
    })

    // Process attendance records
    monthlyRecords.forEach(record => {
      const memberName = record.members.name
      if (record.is_present) {
        report[memberName].present++
      } else {
        report[memberName].absent++
        report[memberName].absentDates.push(new Date(record.date).toLocaleDateString())
      }
    })

    // Calculate percentages
    Object.values(report).forEach(record => {
      record.attendancePercentage = (record.present / workingDays) * 100
    })

    return report
  }

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-2 sm:p-4 md:p-8">
      <Link 
        href="/admin/dashboard" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Image
          src="/logo.png"
          alt="SGC Logo"
          width={100}
          height={100}
        />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Monthly Attendance Reports
          </h1>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value)
              processChartData(attendanceData)
            }}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Attendance Overview</h2>
            <div className="h-[300px] sm:h-[400px]">
              <AttendanceBarChart data={chartData} />
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
            Monthly Attendance Record - {formatMonthDisplay(selectedMonth)}
          </h2>
          
          <div className="overflow-x-auto -mx-3 sm:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y-2 divide-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Name</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Department</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Role</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Working Days</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Present</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Absent</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Attendance %</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-black">Absent Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black bg-white">
                    {Object.values(getMonthlyAttendanceReport()).map((data) => (
                      <tr key={data.name} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium">{data.name}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">{data.department}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">{data.role}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">{data.workingDays}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">{data.present}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">{data.absent}</td>
                        <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          <span className={`font-medium px-2 py-1 rounded-md border-2 border-black ${
                            data.attendancePercentage < 75 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {data.attendancePercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          <div className="max-w-[150px] sm:max-w-[200px] md:max-w-xs overflow-hidden text-ellipsis">
                            {data.absentDates.length > 0 ? 
                              data.absentDates.join(', ') : 
                              'No absences'
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(getMonthlyAttendanceReport()).length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-2 sm:px-4 py-8 text-center text-gray-500 text-sm">
                          No attendance records found for {formatMonthDisplay(selectedMonth)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}