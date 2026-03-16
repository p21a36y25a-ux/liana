import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calculator, CheckCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollService } from '../../services';
import { PayrollPeriod, PayrollStatus } from '../../types';

const PayrollPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', 'periods'],
    queryFn: () => payrollService.getPeriods(),
  });

  const { data: calculations } = useQuery({
    queryKey: ['payroll', 'calculations', selectedPeriod?.id],
    queryFn: () => selectedPeriod ? payrollService.getCalculations(selectedPeriod.id) : null,
    enabled: !!selectedPeriod,
  });

  const calculateMutation = useMutation({
    mutationFn: (periodId: number) => payrollService.calculateForPeriod(periodId),
    onSuccess: () => {
      toast.success('Payroll calculated successfully');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Calculation failed');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (periodId: number) => payrollService.approvePeriod(periodId),
    onSuccess: () => {
      toast.success('Payroll approved');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (periodId: number) => payrollService.markAsPaid(periodId),
    onSuccess: () => {
      toast.success('Payroll marked as paid');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const periods: PayrollPeriod[] = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 mt-1">Kosovo Law compliant payroll processing (EUR €)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Period
        </button>
      </div>

      {/* Kosovo Law Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Kosovo Payroll Calculation Rules</h3>
        <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium">Regular Hours (0-160)</p>
            <p>Rate × 100%</p>
          </div>
          <div>
            <p className="font-medium">Overtime Hours (161-200)</p>
            <p>Rate × 130%</p>
          </div>
          <div>
            <p className="font-medium">Premium Hours (201+)</p>
            <p>Rate × 150%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Periods List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Pay Periods</h2>
          <div className="space-y-3">
            {periods.map((period) => (
              <div
                key={period.id}
                onClick={() => setSelectedPeriod(period)}
                className={`card cursor-pointer transition-all ${
                  selectedPeriod?.id === period.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{period.name}</p>
                  <PayrollStatusBadge status={period.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {period.startDate} → {period.endDate}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {period.workingDays} working days · {period.standardHours}h standard
                </p>

                <div className="flex gap-2 mt-3">
                  {period.status === PayrollStatus.DRAFT && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        calculateMutation.mutate(period.id);
                      }}
                      className="flex items-center gap-1 text-xs btn-secondary py-1 px-2"
                    >
                      <Calculator size={12} />
                      Calculate
                    </button>
                  )}
                  {period.status === PayrollStatus.CALCULATED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveMutation.mutate(period.id);
                      }}
                      className="flex items-center gap-1 text-xs btn-primary py-1 px-2"
                    >
                      <CheckCircle size={12} />
                      Approve
                    </button>
                  )}
                  {period.status === PayrollStatus.APPROVED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markPaidMutation.mutate(period.id);
                      }}
                      className="flex items-center gap-1 text-xs bg-green-600 text-white py-1 px-2 rounded-lg text-xs"
                    >
                      <DollarSign size={12} />
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
            {periods.length === 0 && !isLoading && (
              <p className="text-gray-500 text-center py-4">No payroll periods yet</p>
            )}
          </div>
        </div>

        {/* Calculations */}
        <div className="lg:col-span-2">
          {selectedPeriod ? (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                {selectedPeriod.name} - Employee Calculations
              </h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Employee</th>
                      <th className="text-right py-2 px-3">Reg. Hours</th>
                      <th className="text-right py-2 px-3">OT Hours</th>
                      <th className="text-right py-2 px-3">Prem. Hours</th>
                      <th className="text-right py-2 px-3">Gross Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations?.data?.map((calc: any) => (
                      <tr key={calc.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">
                          {calc.employee?.firstName} {calc.employee?.lastName}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">{calc.regularHours}h</td>
                        <td className="py-2 px-3 text-right text-orange-600">{calc.overtimeHours}h</td>
                        <td className="py-2 px-3 text-right text-red-600">{calc.premiumHours}h</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          €{Number(calc.grossPay).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {(!calculations?.data || calculations.data.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No calculations yet. Click "Calculate" to run payroll.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {calculations?.data?.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="py-2 px-3">Total</td>
                        <td colSpan={3} />
                        <td className="py-2 px-3 text-right">
                          €{calculations.data.reduce(
                            (sum: number, c: any) => sum + Number(c.grossPay),
                            0
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a payroll period to view calculations</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <PayrollPeriodModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['payroll'] });
          }}
        />
      )}
    </div>
  );
};

const PayrollStatusBadge: React.FC<{ status: PayrollStatus }> = ({ status }) => {
  const classes: Record<PayrollStatus, string> = {
    [PayrollStatus.DRAFT]: 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs',
    [PayrollStatus.CALCULATED]: 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs',
    [PayrollStatus.APPROVED]: 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs',
    [PayrollStatus.PAID]: 'bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs',
  };
  return <span className={classes[status]}>{status}</span>;
};

interface PayrollPeriodModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PayrollPeriodModal: React.FC<PayrollPeriodModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    workingDays: 20,
    standardHours: 160,
    overtimeThreshold: 160,
    overtimeRate: 1.3,
    premiumThreshold: 200,
    premiumRate: 1.5,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await payrollService.createPeriod(form);
      toast.success('Payroll period created');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create period');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">New Payroll Period</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Name *</label>
            <input
              type="text"
              placeholder="e.g. January 2024"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
              <input
                type="number"
                value={form.workingDays}
                onChange={(e) => setForm({ ...form, workingDays: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Hours</label>
              <input
                type="number"
                value={form.standardHours}
                onChange={(e) => setForm({ ...form, standardHours: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-medium mb-1">Kosovo Law Defaults:</p>
            <p>• 0-{form.overtimeThreshold}h: 100% rate (Regular)</p>
            <p>• {form.overtimeThreshold}-{form.premiumThreshold}h: {form.overtimeRate * 100}% rate (Overtime)</p>
            <p>• {form.premiumThreshold}h+: {form.premiumRate * 100}% rate (Premium)</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollPage;
