import { Injectable } from '@nestjs/common';
import { CreateGrpackBundleDto } from './dto/create-grpack-bundle.dto';
import { UpdateGrpackBundleDto } from './dto/update-grpack-bundle.dto';

@Injectable()
export class GrpackBundleService {
  create(createGrpackBundleDto: CreateGrpackBundleDto) {
    return 'This action adds a new grpackBundle';
  }

  findAll() {
    return `This action returns all grpackBundle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} grpackBundle`;
  }

  update(id: number, updateGrpackBundleDto: UpdateGrpackBundleDto) {
    return `This action updates a #${id} grpackBundle`;
  }

  remove(id: number) {
    return `This action removes a #${id} grpackBundle`;
  }
}
