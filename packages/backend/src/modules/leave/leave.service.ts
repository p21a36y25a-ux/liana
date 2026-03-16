import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { LeaveBalance } from './leave-balance.entity';
import * as dayjs from 'dayjs';

const LEAVE_DEFAULTS = {
  vacation: 20,
  sick_leave: 15,
  personal: 5,
  maternity: 180,
  paternity: 5,
  unpaid: 0,
  other: 0,
};

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  async createRequest(employeeId: number, data: any): Promise<LeaveRequest> {
    const startDate = dayjs(data.startDate);
    const endDate = dayjs(data.endDate);
    const totalDays = endDate.diff(startDate, 'day') + 1;

    // Check balance for paid leave
    if (data.leaveType !== 'unpaid') {
      const balance = await this.getOrCreateBalance(employeeId, data.leaveType);
      if (balance.remainingDays < totalDays) {
        throw new BadRequestException('Insufficient leave balance');
      }
    }

    const request = this.leaveRequestRepository.create({
      employeeId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
      status: 'pending',
    });
    return this.leaveRequestRepository.save(request);
  }

  async approveByManager(requestId: number, managerId: number, comment?: string): Promise<LeaveRequest> {
    const request = await this.findById(requestId);
    request.status = 'approved_by_manager';
    request.managerComment = comment;
    request.approvedById = managerId;
    return this.leaveRequestRepository.save(request);
  }

  async approveByHR(requestId: number, hrUserId: number, comment?: string): Promise<LeaveRequest> {
    const request = await this.findById(requestId);
    request.status = 'approved';
    request.hrComment = comment;
    request.approvedById = hrUserId;

    // Deduct leave balance
    const balance = await this.getOrCreateBalance(request.employeeId, request.leaveType);
    balance.usedDays = Number(balance.usedDays) + Number(request.totalDays);
    balance.remainingDays = Number(balance.totalDays) - Number(balance.usedDays);
    await this.leaveBalanceRepository.save(balance);

    return this.leaveRequestRepository.save(request);
  }

  async reject(requestId: number, userId: number, comment: string): Promise<LeaveRequest> {
    const request = await this.findById(requestId);
    request.status = 'rejected';
    request.hrComment = comment;
    return this.leaveRequestRepository.save(request);
  }

  async cancel(requestId: number, employeeId: number): Promise<LeaveRequest> {
    const request = await this.findById(requestId);
    if (request.employeeId !== employeeId) throw new BadRequestException('Not authorized');
    if (request.status === 'approved') {
      // Return days to balance
      const balance = await this.getOrCreateBalance(request.employeeId, request.leaveType);
      balance.usedDays = Math.max(0, Number(balance.usedDays) - Number(request.totalDays));
      balance.remainingDays = Number(balance.totalDays) - Number(balance.usedDays);
      await this.leaveBalanceRepository.save(balance);
    }
    request.status = 'cancelled';
    return this.leaveRequestRepository.save(request);
  }

  async findById(id: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Leave request not found');
    return request;
  }

  async getEmployeeRequests(employeeId: number): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: [{ status: 'pending' }, { status: 'approved_by_manager' }],
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllRequests(query?: any): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: query?.employeeId ? { employeeId: query.employeeId } : {},
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  private async getOrCreateBalance(employeeId: number, leaveType: string): Promise<LeaveBalance> {
    const year = new Date().getFullYear();
    let balance = await this.leaveBalanceRepository.findOne({
      where: { employeeId, year, leaveType: leaveType as any },
    });
    if (!balance) {
      const totalDays = LEAVE_DEFAULTS[leaveType] || 0;
      balance = this.leaveBalanceRepository.create({
        employeeId,
        year,
        leaveType: leaveType as any,
        totalDays,
        usedDays: 0,
        remainingDays: totalDays,
      });
      balance = await this.leaveBalanceRepository.save(balance);
    }
    return balance;
  }

  async getEmployeeBalances(employeeId: number): Promise<LeaveBalance[]> {
    const year = new Date().getFullYear();
    const existing = await this.leaveBalanceRepository.find({
      where: { employeeId, year },
    });
    // Initialize missing balances
    const leaveTypes = ['vacation', 'sick_leave', 'personal', 'maternity', 'paternity'];
    for (const type of leaveTypes) {
      if (!existing.find(b => b.leaveType === type)) {
        await this.getOrCreateBalance(employeeId, type);
      }
    }
    return this.leaveBalanceRepository.find({ where: { employeeId, year } });
  }
}
