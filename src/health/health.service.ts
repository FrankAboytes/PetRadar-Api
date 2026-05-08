import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HealthRecord } from './health.schema';

@Injectable()
export class HealthService {
  constructor(@InjectModel(HealthRecord.name) private healthModel: Model<HealthRecord>) {}

  async create(data: any) {
    return this.healthModel.create(data);
  }

  async findByPet(petId: string) {
    return this.healthModel.find({ petId }).sort({ date: -1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.healthModel.findById(id);
    if (!record) throw new NotFoundException('Registro no encontrado');
    return record;
  }

  async update(id: string, data: any) {
    return this.healthModel.findByIdAndUpdate(id, data, { new: true });
  }

  async remove(id: string) {
    return this.healthModel.findByIdAndDelete(id);
  }
}
