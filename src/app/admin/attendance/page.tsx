"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Share2, ArrowLeft } from "lucide-react";
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
type Member = {
  id: number;
  name: string;
  department: string;
  role: string;
};

 

export default function DailyAttendance() {
  const [members, setMembers] = useState<Member[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  const [message, setMessage] = useState<string>("");
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

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("members").select("*");
    if (error) console.error("Error fetching members:", error);
    else setMembers(data || []);
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select("member_id, is_present")
      .eq("date", date);

    if (error) {
      console.error("Error fetching attendance:", error);
    } else {
      const fetchedAttendance = data.reduce((acc: { [key: number]: boolean }, record: { member_id: number; is_present: boolean }) => {
        acc[record.member_id] = record.is_present;
        return acc;
      }, {});
      setAttendance(fetchedAttendance);
    }
  };

  const handleAttendanceChange = (memberId: number, isPresent: boolean) => {
    setAttendance((prev) => ({ ...prev, [memberId]: isPresent }));
  };

  const submitAttendance = async () => {
    const attendanceRecords = Object.entries(attendance).map(([memberId, isPresent]) => ({
      member_id: Number(memberId),
      date,
      is_present: isPresent,
    }));

    const { error } = await supabase.from("attendance").upsert(attendanceRecords, { onConflict: "member_id, date" });
    if (error) console.error("Error submitting attendance:", error);
    else {
      alert(`📅 ${date}'s attendance was updated successfully ✅`);
      generateMessage();
    }
  };

  const generateMessage = () => {
    const presentMembers = members.filter((m) => attendance[m.id]);
    const absentMembers = members.filter((m) => !attendance[m.id]);
    
    const formattedMessage = `*Attendance Report - ${date}* \n\n *Present (${presentMembers.length}):* \n${presentMembers.map(m => `- ${m.name}`).join("\n") || "None"}\n\n *Absent (${absentMembers.length}):* \n${absentMembers.map(m => `- ${m.name}`).join("\n") || "None"}\n\n *Stay consistent and keep learning!* `;
    setMessage(formattedMessage);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="SGC Logo"
          width={120}
          height={120}
        />
        </div>
      <Card className="max-w-6xl mx-auto bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-8">
          <h1 className="text-4xl font-black tracking-tight mb-8">Daily Attendance</h1>
          
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow mb-8"
          />

          <div className="overflow-x-auto border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full border-collapse">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="border-b-2 border-black p-4 text-left">Name</th>
                  <th className="border-b-2 border-black p-4 text-left">Department</th>
                  <th className="border-b-2 border-black p-4 text-left">Role</th>
                  <th className="border-b-2 border-black p-4 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-black last:border-b-0">
                    <td className="p-4 font-medium">{member.name}</td>
                    <td className="p-4">{member.department}</td>
                    <td className="p-4">{member.role}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleAttendanceChange(member.id, true)}
                          className={`w-12 h-12 flex items-center justify-center text-xl rounded-md border-2 border-black transition-all ${
                            attendance[member.id] 
                              ? "bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]" 
                              : "bg-gray-100 hover:bg-green-100"
                          }`}
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(member.id, false)}
                          className={`w-12 h-12 flex items-center justify-center text-xl rounded-md border-2 border-black transition-all ${
                            attendance[member.id] === false 
                              ? "bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]" 
                              : "bg-gray-100 hover:bg-red-100"
                          }`}
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            onClick={submitAttendance} 
            className="mt-8 px-6 py-3 bg-blue-500 text-white font-bold rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Submit Attendance
          </button>

          {message && (
            <div className="mt-8 p-6 border-2 border-black rounded-lg bg-green-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>
              <pre className="whitespace-pre-wrap font-medium">{message}</pre>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-3 bg-green-500 text-white font-bold rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share on WhatsApp
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}