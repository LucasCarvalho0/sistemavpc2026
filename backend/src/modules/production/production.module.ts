import { Module } from '@nestjs/common'
import { ProductionController } from './production.controller'
import { ProductionService } from './production.service'
import { ProductionGateway } from './production.gateway'

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, ProductionGateway],
})
export class ProductionModule {}
