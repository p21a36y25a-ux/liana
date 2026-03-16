import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesService, punchesService } from '../../services';
import { Employee, PunchType } from '../../types';
import CameraCapture from '../../components/camera/CameraCapture';

const TimeTrackingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [punchType, setPunchType] = useState<PunchType | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [search, setSearch] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: employeesService.getActive,
  });

  const punchMutation = useMutation({
    mutationFn: async (photoData: string) => {
      if (!selectedEmployee || !punchType) return;
      return punchesService.create({
        employeeId: selectedEmployee.id,
        type: punchType,
        photoData,
      });
    },
    onSuccess: () => {
      toast.success(
        `${selectedEmployee?.firstName} ${punchType === PunchType.CHECK_IN ? 'checked in' : 'checked out'} successfully!`
      );
      setSelectedEmployee(null);
      setPunchType(null);
      setShowCamera(false);
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Punch failed');
      setShowCamera(false);
    },
  });

  const handleEmployeeClick = (employee: Employee, type: PunchType) => {
    setSelectedEmployee(employee);
    setPunchType(type);
    setShowCamera(true);
  };

  const handlePhotoCapture = (photoData: string) => {
    punchMutation.mutate(photoData);
  };

  const filteredEmployees = employees.filter((emp: Employee) =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-500 mt-1">Click on an employee's name to record attendance</p>
      </div>

      {/* Real-time clock */}
      <div className="card mb-6 text-center">
        <Clock size={32} className="mx-auto text-primary-600 mb-2" />
        <RealTimeClock />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredEmployees.map((employee: Employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onCheckIn={() => handleEmployeeClick(employee, PunchType.CHECK_IN)}
              onCheckOut={() => handleEmployeeClick(employee, PunchType.CHECK_OUT)}
            />
          ))}
        </div>
      )}

      {filteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No employees found
        </div>
      )}

      {showCamera && selectedEmployee && (
        <div>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
            <div className="bg-white rounded-xl p-4 shadow-xl mb-4 max-w-sm w-full">
              <p className="text-center font-medium">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </p>
              <p className="text-center text-sm text-gray-500 capitalize">
                {punchType?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <CameraCapture
            photoData=""
            onCapture={handlePhotoCapture}
            onClose={() => {
              setShowCamera(false);
              setSelectedEmployee(null);
              setPunchType(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

const RealTimeClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <p className="text-4xl font-bold text-gray-900">
        {time.toLocaleTimeString()}
      </p>
      <p className="text-gray-500 mt-1">
        {time.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
};

interface EmployeeCardProps {
  employee: Employee;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onCheckIn, onCheckOut }) => {
  return (
    <div className="card hover:shadow-md transition-shadow p-4">
      <div className="text-center">
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
            <span className="text-primary-600 font-bold text-lg">
              {employee.firstName[0]}{employee.lastName[0]}
            </span>
          </div>
        )}
        <p className="font-medium text-sm text-gray-900 truncate">
          {employee.firstName} {employee.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate mb-3">{employee.position}</p>

        <div className="flex gap-2">
          <button
            onClick={onCheckIn}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors"
            title="Check In"
          >
            <CheckCircle size={12} />
            In
          </button>
          <button
            onClick={onCheckOut}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
            title="Check Out"
          >
            <XCircle size={12} />
            Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPage;
