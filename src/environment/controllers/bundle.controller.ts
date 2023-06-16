import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnvironmentService } from '../environment.service';
import { UpdateNodeDto } from '../../node/dto/update-node.dto';
import { BundleService } from '../../bundle/bundle.service';
import { CreateBundleDto } from '../../bundle/dto/rename-bundle.dto';
import { Environment } from '../entities/environment.entity';

@ApiTags('bundles')
@Controller('environment/:idEnv')
export class BundleController {
  constructor(
    private bundleService: BundleService,
    private environmentService: EnvironmentService,
  ) {}

  @Post('bundles/')
  create(
    @Param('idEnv') idEnv: string,
    @Body() createBundletDto: CreateBundleDto,
  ) {
    return this.bundleService.create(idEnv, createBundletDto);
  }

  @Get('bundles/')
  async findAll(@Param('idEnv') idEnv: string) {
    const env = await this.environmentService.findOneBy({ name: idEnv });
    return env.bundles;
  }

  @Get('bundles/:idBundle')
  async findOne(
    @Param('idEnv') idEnv: string,
    @Param('idBundle') idBundle: string,
  ) {
    return await this.bundleService.findOneBy({
      name: idBundle,
      environment: await this.environmentService.findOneBy({ name: idEnv }),
    });
  }

  @Patch('bundles/:idBundle')
  update(
    @Param('idEnv') idEnv: string,
    @Param('idBundle') idBundle: string,
    @Body() updateGrouptDto: UpdateNodeDto,
  ) {
    return this.bundleService.update(idBundle, updateGrouptDto);
  }

  @Delete('bundles/:idBundle')
  remove(@Param('idEnv') idEnv: string, @Param('idBundle') idBundle: string) {
    return this.bundleService.removeBy({ name: idBundle });
  }
}
