'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  total_attendance: number;
  last_attendance: string;
}

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEmployees(data.employees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ko delete karna chahte hain?`)) return;
    setDeleting(id);
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Delete failed');
      setEmployees(employees.filter((e) => e.id !== id));
    } catch (err) {
      alert('Delete failed, try again');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Employees & Interns ({employees.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Days</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Marked</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-900 font-medium">{emp.name}</td>
                <td className="py-3 px-4 text-slate-600">{emp.email}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${emp.role === 'intern'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                    }`}>
                    {emp.role === 'intern' ? 'Intern' : 'Employee'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{emp.total_attendance || 0}</td>
                <td className="py-3 px-4 text-slate-600">
                  {emp.last_attendance
                    ? new Date(emp.last_attendance).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <Button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    disabled={deleting === emp.id}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 h-auto"
                  >
                    {deleting === emp.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length === 0 && (
        <div className="text-center py-8 text-slate-500">No employees found</div>
      )}
    </Card>
  );
}