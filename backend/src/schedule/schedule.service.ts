import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from './schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
  ) {}

  async generateSchedule(startDate: Date, endDate: Date): Promise<any> {
    // TODO: Complete the implementation of this method
    throw new NotImplementedException();
  }

  async getSchedules(): Promise<any> {
    return this.scheduleRepository.find();
  }

  async getScheduleById(id: number): Promise<any> {
    return this.scheduleRepository.findOneByOrFail({id});
  }

  async getScheduleRequirements(): Promise<any> {
    // TODO: Complete the implementation of this method
    // Schedule requirements can be hard-coded
    // Requirements must indicate the number of nurses required for each shift type on each day of a week
    // Create the requirements as JSON and make it available via this method
    throw new NotImplementedException();
  }
}
