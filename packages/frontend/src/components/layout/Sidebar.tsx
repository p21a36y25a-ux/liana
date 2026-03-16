import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/time-tracking', icon: Clock, label: 'Time Tracking' },
  { path: '/employees', icon: Users, label: 'Employees', roles: [UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.MANAGER] },
  { path: '/attendance', icon: Calendar, label: 'Attendance' },
  { path: '/leave', icon: FileText, label: 'Leave' },
  { path: '/payroll', icon: DollarSign, label: 'Payroll', roles: [UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN] },
  { path: '/departments', icon: Building2, label: 'Departments', roles: [UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN] },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useAppStore();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } min-h-screen`}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">L</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm">Liana HR</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
