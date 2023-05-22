import { Injectable } from '@nestjs/common';
import { CreateNodeGroupDto } from './dto/create-node-group.dto';
import { UpdateNodeGroupDto } from './dto/update-node-group.dto';

@Injectable()
export class NodeGroupService {
  create(createNodeGroupDto: CreateNodeGroupDto) {
    return 'This action adds a new nodeGroup';
  }

  findAll() {
    return `This action returns all nodeGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nodeGroup`;
  }

  update(id: number, updateNodeGroupDto: UpdateNodeGroupDto) {
    return `This action updates a #${id} nodeGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} nodeGroup`;
  }
}
