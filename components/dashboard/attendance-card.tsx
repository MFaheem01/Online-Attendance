'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Status = 'none' | 'checkedin' | 'completed';

export function AttendanceCard() {
  const [status, setStatus] = useState<Status>('none');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const [savedTask, setSavedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/attendance/get');
      const data = await res.json();
      setStatus(data.status || 'none');
      if (data.check_in_time) setCheckInTime(new Date(data.check_in_time).toLocaleTimeString());
      if (data.check_out_time) setCheckOutTime(new Date(data.check_out_time).toLocaleTimeString());
      if (data.task) setSavedTask(data.task);
    } catch { }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkin', task }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStatus('checkedin');
      setCheckInTime(new Date(data.attendance.check_in_time).toLocaleTimeString());
      if (task) setSavedTask(task);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStatus('completed');
      setCheckOutTime(new Date().toLocaleTimeString());
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Today's Attendance</h2>

      <div className="flex gap-3 flex-wrap">
        {checkInTime && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✓ Checked in at {checkInTime}
          </span>
        )}
        {checkOutTime && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            ✓ Checked out at {checkOutTime}
          </span>
        )}
      </div>

      {status === 'none' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Today's Task (optional)
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What will you be working on today?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Please wait...' : '🟢 Check In'}
          </Button>
        </div>
      )}

      {status === 'checkedin' && (
        <div className="space-y-3">
          {savedTask && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Today's task:</p>
              <p className="text-slate-700 text-sm">{savedTask}</p>
            </div>
          )}
          <Button
            onClick={handleCheckOut}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? 'Please wait...' : '🔴 Check Out'}
          </Button>
        </div>
      )}

      {status === 'completed' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 font-medium">✅ Attendance completed for today!</p>
          {savedTask && (
            <div className="mt-2">
              <p className="text-xs text-slate-500">Task:</p>
              <p className="text-slate-600 text-sm">{savedTask}</p>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">Button will re-enable tomorrow</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
      )}
    </Card>
  );
}