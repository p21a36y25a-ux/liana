import { create } from 'zustand';
import { Employee, AttendanceStatus } from '../types';

interface AttendanceRecord {
  employeeId: number;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

interface AppState {
  sidebarOpen: boolean;
  todayAttendance: AttendanceRecord[];
  setSidebarOpen: (open: boolean) => void;
  setTodayAttendance: (records: AttendanceRecord[]) => void;
  updateEmployeeStatus: (employeeId: number, status: AttendanceStatus) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  todayAttendance: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTodayAttendance: (records) => set({ todayAttendance: records }),

  updateEmployeeStatus: (employeeId, status) =>
    set((state) => ({
      todayAttendance: state.todayAttendance.map((record) =>
        record.employeeId === employeeId ? { ...record, status } : record,
      ),
    })),
}));
