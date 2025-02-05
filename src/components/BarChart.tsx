"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
}

interface BarChartProps {
  data: AttendanceData[];
}

export default function AttendanceBarChart({ data }: BarChartProps) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="present" fill="#4ade80" name="Present" />
          <Bar dataKey="absent" fill="#f87171" name="Absent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}