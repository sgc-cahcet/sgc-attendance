"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Share2, ArrowLeft, Check, X } from "lucide-react";
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Member = {
  id: number;
  name: string;
  department: string;
  role: string;
  academicYear: string;
};

type GroupedMembers = {
  [key: string]: Member[];
};

export default function DailyAttendance() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groupedMembers, setGroupedMembers] = useState<GroupedMembers>({});
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  const [message, setMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const yearOrder: { [key: string]: number } = {
    'IV': 1,
    'III': 2,
    'II': 3,
    'I': 4
  };

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

  useEffect(() => {
    organizeMembers();
  }, [members]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order('academicYear', { ascending: false });
      
    if (error) console.error("Error fetching members:", error);
    else setMembers(data || []);
  };

  const organizeMembers = () => {
    const grouped = members.reduce((acc: GroupedMembers, member) => {
      const year = member.academicYear || 'Other';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(member);
      return acc;
    }, {});

    Object.keys(grouped).forEach(year => {
      grouped[year].sort((a, b) => a.name.localeCompare(b.name));
    });

    setGroupedMembers(grouped);
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

    const { error } = await supabase
      .from("attendance")
      .upsert(attendanceRecords, { onConflict: "member_id, date" });
      
    if (error) console.error("Error submitting attendance:", error);
    else {
      alert(`📅 ${date}'s attendance was updated successfully ✅`);
      generateMessage();
    }
  };

  const generateMessage = () => {
    const presentMembers = members.filter((m) => attendance[m.id]);
    const absentMembers = members.filter((m) => !attendance[m.id]);
    
    const formattedMessage = `*Attendance Report - ${date}* \n\n *Present (${presentMembers.length}):* \n${presentMembers.map(m => `- ${m.name} (${m.academicYear} Year)`).join("\n") || "None"}\n\n *Absent (${absentMembers.length}):* \n${absentMembers.map(m => `- ${m.name} (${m.academicYear} Year)`).join("\n") || "None"}\n\n *Stay consistent and keep learning!* `;
    setMessage(formattedMessage);
  };

  const renderYearCard = (year: string, members: Member[]) => (
    <Card key={year} className="mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
      <div className="bg-yellow-100 border-b-2 border-black p-4 rounded-t-md">
        <h3 className="text-xl font-bold">{year} Year Students</h3>
        <p className="text-sm text-gray-600 mt-1">{members.length} members</p>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-bold border-b-2 border-black">Name</th>
                <th className="px-4 py-3 text-center font-bold border-b-2 border-black w-[140px]">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr 
                  key={member.id}
                  className={`hover:bg-gray-50 ${index !== members.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{member.name}</p>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                    <button
                    onClick={() => handleAttendanceChange(member.id, true)}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border-2 border-black transition-all ${
                    attendance[member.id] 
                     ? "bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]" 
                    : "bg-gray-100 hover:bg-green-100"
                   }`}
                >
                <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAttendanceChange(member.id, false)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md border-2 border-black transition-all ${
                    attendance[member.id] === false 
                      ? "bg-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]" 
                      : "bg-gray-100 hover:bg-red-100"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <Link 
        href="/admin/dashboard" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>
      
      <div className="flex items-center justify-center mb-6">
        <Image
          src="/logo.png"
          alt="SGC Logo"
          width={100}
          height={100}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Daily Attendance</h1>
            
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
          </div>
        </Card>

        <div className="space-y-6">
          {Object.entries(groupedMembers)
            .sort(([yearA], [yearB]) => (yearOrder[yearA] || 999) - (yearOrder[yearB] || 999))
            .map(([year, yearMembers]) => renderYearCard(year, yearMembers))}
        </div>

        <div className="mt-6 space-y-6">
          <button 
            onClick={submitAttendance} 
            className="w-full px-6 py-4 bg-blue-500 text-white font-bold rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Submit Attendance
          </button>

          {message && (
            <Card className="border-2 border-black bg-green-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold mb-4">Attendance Summary</h2>
                <pre className="whitespace-pre-wrap font-medium text-sm md:text-base">{message}</pre>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full px-4 md:px-6 py-3 bg-green-500 text-white font-bold rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share on WhatsApp
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}