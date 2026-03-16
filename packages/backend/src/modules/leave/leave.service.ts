import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveStatus,
  LeaveType,
} from './entities/leave.entity';
import {
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
} from './dto/leave.dto';

@Injectable()
export class LeaveService {
  private readonly LEAVE_DEFAULTS: Record<LeaveType, number> = {
    [LeaveType.VACATION]: 20,
    [LeaveType.SICK]: 14,
    [LeaveType.PERSONAL]: 3,
    [LeaveType.UNPAID]: 0,
    [LeaveType.MATERNITY]: 270,
    [LeaveType.PATERNITY]: 5,
    [LeaveType.BEREAVEMENT]: 3,
  };

  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  private calculateWorkingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  async createRequest(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const totalDays = this.calculateWorkingDays(dto.startDate, dto.endDate);
    if (totalDays <= 0) {
      throw new BadRequestException('Invalid date range');
    }

    if (dto.leaveType !== LeaveType.UNPAID && dto.leaveType !== LeaveType.SICK) {
      const balance = await this.getBalance(
        dto.employeeId,
        dto.leaveType,
        new Date().getFullYear(),
      );
      if (balance && balance.remainingDays < totalDays) {
        throw new BadRequestException('Insufficient leave balance');
      }
    }

    const request = this.leaveRequestRepository.create({
      ...dto,
      totalDays,
      status: LeaveStatus.PENDING,
    });

    return this.leaveRequestRepository.save(request);
  }

  async review(
    id: number,
    reviewDto: ReviewLeaveRequestDto,
    reviewerId: number,
    reviewerRole: string,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Leave request #${id} not found`);
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is no longer pending');
    }

    request.status = reviewDto.status;

    if (reviewerRole === 'manager') {
      request.managerId = reviewerId;
      request.managerComment = reviewDto.comment;
    } else {
      request.hrAdminId = reviewerId;
      request.hrAdminComment = reviewDto.comment;
    }

    if (reviewDto.status === LeaveStatus.APPROVED) {
      request.approvedAt = new Date();
      await this.updateBalance(
        request.employeeId,
        request.leaveType,
        new Date().getFullYear(),
        request.totalDays,
      );
    } else {
      request.rejectedAt = new Date();
    }

    return this.leaveRequestRepository.save(request);
  }

  async cancel(id: number, employeeId: number): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id, employeeId },
    });
    if (!request) throw new NotFoundException(`Leave request #${id} not found`);
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    request.status = LeaveStatus.CANCELLED;
    return this.leaveRequestRepository.save(request);
  }

  async findAll(options?: {
    employeeId?: number;
    status?: LeaveStatus;
    leaveType?: LeaveType;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .orderBy('leave.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.employeeId) {
      qb.andWhere('leave.employeeId = :employeeId', {
        employeeId: options.employeeId,
      });
    }
    if (options?.status) {
      qb.andWhere('leave.status = :status', { status: options.status });
    }
    if (options?.leaveType) {
      qb.andWhere('leave.leaveType = :leaveType', {
        leaveType: options.leaveType,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getBalance(
    employeeId: number,
    leaveType: LeaveType,
    year: number,
  ): Promise<LeaveBalance | null> {
    return this.leaveBalanceRepository.findOne({
      where: { employeeId, leaveType, year },
    });
  }

  async getAllBalances(employeeId: number, year: number) {
    return this.leaveBalanceRepository.find({
      where: { employeeId, year },
    });
  }

  async initializeBalances(employeeId: number, year: number): Promise<LeaveBalance[]> {
    const balances: LeaveBalance[] = [];

    for (const [type, days] of Object.entries(this.LEAVE_DEFAULTS)) {
      const existing = await this.leaveBalanceRepository.findOne({
        where: { employeeId, leaveType: type as LeaveType, year },
      });

      if (!existing) {
        const balance = this.leaveBalanceRepository.create({
          employeeId,
          leaveType: type as LeaveType,
          year,
          totalDays: days,
          usedDays: 0,
          remainingDays: days,
        });
        balances.push(await this.leaveBalanceRepository.save(balance));
      } else {
        balances.push(existing);
      }
    }

    return balances;
  }

  private async updateBalance(
    employeeId: number,
    leaveType: LeaveType,
    year: number,
    daysUsed: number,
  ): Promise<void> {
    const balance = await this.leaveBalanceRepository.findOne({
      where: { employeeId, leaveType, year },
    });

    if (balance) {
      balance.usedDays = Number(balance.usedDays) + daysUsed;
      balance.remainingDays = Number(balance.totalDays) - Number(balance.usedDays);
      await this.leaveBalanceRepository.save(balance);
    }
  }
}
