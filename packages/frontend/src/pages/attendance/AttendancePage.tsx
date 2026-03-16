import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../../services';

const AttendancePage: React.FC = () => {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', { startDate, endDate, page }],
    queryFn: () => attendanceService.getAll({ startDate, endDate, page }),
  });

  const records = data?.data || [];
  const total = data?.total || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-500 mt-1">{total} total records</p>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="input-field w-auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="input-field w-auto"
            />
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3">Employee</th>
                  <th className="text-left py-3 px-3">Date</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Check In</th>
                  <th className="text-left py-3 px-3">Check Out</th>
                  <th className="text-left py-3 px-3">Hours</th>
                  <th className="text-left py-3 px-3">Late (min)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: any) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <p className="font-medium">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{record.date}</td>
                    <td className="py-3 px-3">
                      <span className={
                        record.status === 'present' ? 'badge-present' :
                        record.status === 'late' ? 'badge-late' :
                        record.status === 'on_leave' ? 'badge-on-leave' :
                        'badge-absent'
                      }>
                        {record.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.totalHours ? `${record.totalHours}h` : '-'}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{record.lateMinutes || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <p className="text-center py-8 text-gray-500">No attendance records found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
