import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Clock, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { attendanceService, employeesService } from '../../services';
import { AttendanceStatus } from '../../types';

const DashboardPage: React.FC = () => {
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: attendanceService.getToday,
    refetchInterval: 30000,
  });

  const { data: activeEmployees = [] } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: employeesService.getActive,
  });

  const totalEmployees = activeEmployees.length;
  const presentCount = todayAttendance.filter(
    (a: any) => a.status === AttendanceStatus.PRESENT
  ).length;
  const lateCount = todayAttendance.filter(
    (a: any) => a.status === AttendanceStatus.LATE
  ).length;
  const onLeaveCount = todayAttendance.filter(
    (a: any) => a.status === AttendanceStatus.ON_LEAVE
  ).length;
  const absentCount = Math.max(0, totalEmployees - presentCount - lateCount - onLeaveCount);
  const attendanceRate = totalEmployees > 0
    ? Math.round(((presentCount + lateCount) / totalEmployees) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      iconBg: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Present Today',
      value: presentCount + lateCount,
      icon: UserCheck,
      iconBg: 'bg-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Absent Today',
      value: absentCount,
      icon: UserX,
      iconBg: 'bg-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'On Leave',
      value: onLeaveCount,
      icon: Clock,
      iconBg: 'bg-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Today's overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`card ${stat.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
                <div className={`${stat.iconBg} p-2 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalEmployees > 0 && (
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold">Today's Attendance Rate</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <span className="text-lg font-bold text-gray-900">{attendanceRate}%</span>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Today's Status</h2>
        {todayAttendance.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance records yet today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Employee</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Check In</th>
                  <th className="text-left py-2 px-3">Check Out</th>
                  <th className="text-left py-2 px-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.slice(0, 10).map((record: any) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <p className="font-medium">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{record.employee?.position}</p>
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {record.totalHours ? `${record.totalHours}h` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const classes: Record<string, string> = {
    present: 'badge-present',
    absent: 'badge-absent',
    late: 'badge-late',
    on_leave: 'badge-on-leave',
    half_day: 'bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium',
  };

  return (
    <span className={classes[status] || 'badge-absent'}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default DashboardPage;
