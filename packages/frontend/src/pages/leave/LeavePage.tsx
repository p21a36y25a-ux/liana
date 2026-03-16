import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { leaveService } from '../../services';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const LeavePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | LeaveStatus>('all');

  const canApprove = user?.role === UserRole.MANAGER ||
    user?.role === UserRole.HR_ADMIN ||
    user?.role === UserRole.SYSTEM_ADMIN;

  const { data, isLoading } = useQuery({
    queryKey: ['leave', 'requests', activeTab],
    queryFn: () =>
      leaveService.getRequests(activeTab !== 'all' ? { status: activeTab } : {}),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: number; status: string; comment?: string }) =>
      leaveService.reviewRequest(id, { status, comment }),
    onSuccess: () => {
      toast.success('Leave request updated');
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update request');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => leaveService.cancelRequest(id),
    onSuccess: () => {
      toast.success('Leave request cancelled');
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });

  const requests: LeaveRequest[] = data?.data || [];

  const tabs = [
    { id: 'all', label: 'All' },
    { id: LeaveStatus.PENDING, label: 'Pending' },
    { id: LeaveStatus.APPROVED, label: 'Approved' },
    { id: LeaveStatus.REJECTED, label: 'Rejected' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage leave requests and balances</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Request Leave
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
                  <th className="text-left py-3 px-3">Type</th>
                  <th className="text-left py-3 px-3">Duration</th>
                  <th className="text-left py-3 px-3">Days</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Submitted</th>
                  {canApprove && <th className="text-right py-3 px-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <p className="font-medium">
                        {req.employee?.firstName} {req.employee?.lastName}
                      </p>
                    </td>
                    <td className="py-3 px-3 capitalize text-gray-600">
                      {req.leaveType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{req.totalDays}</td>
                    <td className="py-3 px-3">
                      <LeaveStatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    {canApprove && (
                      <td className="py-3 px-3 text-right">
                        {req.status === LeaveStatus.PENDING && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                reviewMutation.mutate({ id: req.id, status: 'approved' })
                              }
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                reviewMutation.mutate({ id: req.id, status: 'rejected' })
                              }
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <p className="text-center py-8 text-gray-500">No leave requests found</p>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <LeaveRequestModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['leave'] });
          }}
        />
      )}
    </div>
  );
};

const LeaveStatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const classes: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium',
    [LeaveStatus.APPROVED]: 'badge-present',
    [LeaveStatus.REJECTED]: 'badge-absent',
    [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium',
  };
  return <span className={classes[status]}>{status}</span>;
};

interface LeaveRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: '',
    leaveType: LeaveType.VACATION,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leaveService.createRequest({
        ...form,
        employeeId: Number(form.employeeId),
      });
      toast.success('Leave request submitted');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Request Leave</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
            <input
              type="number"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveType })}
              className="input-field"
            >
              {Object.values(LeaveType).map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeavePage;
