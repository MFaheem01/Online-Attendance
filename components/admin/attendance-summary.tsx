'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Attendance {
  id: string;
  name: string;
  email: string;
  marked: boolean;
  check_in_time: string;
}

export function AttendanceSummary() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/admin/attendance');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAttendance(data.attendance);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const markedCount = attendance.filter((a) => a.marked).length;
  const unmarkedCount = attendance.length - markedCount;

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <p className="text-slate-600 text-sm mb-1">Marked Attendance</p>
          <p className="text-4xl font-bold text-green-600">
            {markedCount}
            <span className="text-lg text-slate-600 ml-2">/ {attendance.length}</span>
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-slate-600 text-sm mb-1">Unmarked Attendance</p>
          <p className="text-4xl font-bold text-red-600">{unmarkedCount}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Today's Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Check-in Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att) => (
                <tr key={att.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-900">{att.name}</td>
                  <td className="py-3 px-4 text-slate-600">{att.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        att.marked
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {att.marked ? '✓ Present' : '✗ Absent'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {att.marked && att.check_in_time
                      ? new Date(att.check_in_time).toLocaleTimeString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
