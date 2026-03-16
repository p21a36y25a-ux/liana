import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesService, departmentsService } from '../../services';
import { Employee } from '../../types';

const EmployeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search, page }],
    queryFn: () => employeesService.getAll({ search, page, limit: 20 }),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsService.getAll,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => employeesService.update(id, { isActive: false }),
    onSuccess: () => {
      toast.success('Employee deactivated');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const employees: Employee[] = data?.data || [];
  const total: number = data?.total || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">{total} total employees</p>
        </div>
        <button
          onClick={() => { setEditEmployee(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3">Employee</th>
                  <th className="text-left py-3 px-3">Code</th>
                  <th className="text-left py-3 px-3">Department</th>
                  <th className="text-left py-3 px-3">Position</th>
                  <th className="text-left py-3 px-3">Hourly Rate</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-right py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-xs">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{emp.employeeCode}</td>
                    <td className="py-3 px-3 text-gray-600">{emp.department?.name || '-'}</td>
                    <td className="py-3 px-3 text-gray-600">{emp.position}</td>
                    <td className="py-3 px-3 text-gray-600">€{Number(emp.hourlyRate).toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={emp.isActive ? 'badge-present' : 'badge-absent'}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditEmployee(emp); setShowForm(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        {emp.isActive && (
                          <button
                            onClick={() => {
                              if (window.confirm('Deactivate this employee?')) {
                                deactivateMutation.mutate(emp.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <p className="text-center py-8 text-gray-500">No employees found</p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          employee={editEmployee}
          departments={departments}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['employees'] });
          }}
        />
      )}
    </div>
  );
};

interface EmployeeFormProps {
  employee: Employee | null;
  departments: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormProps> = ({
  employee,
  departments,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    employeeCode: employee?.employeeCode || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    departmentId: employee?.departmentId || '',
    position: employee?.position || '',
    hourlyRate: employee?.hourlyRate || '',
    startDate: employee?.startDate || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee) {
        await employeesService.update(employee.id, {
          ...form,
          hourlyRate: Number(form.hourlyRate),
          departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        });
        toast.success('Employee updated');
      } else {
        await employeesService.create({
          ...form,
          hourlyRate: Number(form.hourlyRate),
          departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        });
        toast.success('Employee created');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code *</label>
              <input
                type="text"
                value={form.employeeCode}
                onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="input-field"
              >
                <option value="">No Department</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeesPage;
