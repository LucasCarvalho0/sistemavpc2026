import {
  Controller, Get, Post, Body, Param, Query
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ProductionService } from './production.service'
import { ProductionGateway } from './production.gateway'
import { CreateProductionDto } from './dto/create-production.dto'
import { HistoryFiltersDto } from './dto/history-filters.dto'

@ApiTags('production')
@Controller('production')
export class ProductionController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly productionGateway: ProductionGateway,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as produções (com filtros e paginação)' })
  getAll(@Query() filters: HistoryFiltersDto) {
    return this.productionService.getAll(filters)
  }

  @Get('today')
  @ApiOperation({ summary: 'Listar produções do turno atual' })
  getToday() {
    return this.productionService.getToday()
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Ranking de produção do dia' })
  getRanking() {
    return this.productionService.getRanking(1)
  }

  @Get('ranking/quarter')
  @ApiOperation({ summary: 'Ranking de produção do trimestre (90 dias)' })
  getQuarterRanking() {
    return this.productionService.getRanking(90)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do turno' })
  getStats() {
    return this.productionService.getStats()
  }

  @Get('hourly')
  @ApiOperation({ summary: 'Produção por hora do turno' })
  getHourly() {
    return this.productionService.getHourlyData()
  }

  @Get('evolution/quarter')
  @ApiOperation({ summary: 'Evolução de produção do trimestre (90 dias)' })
  getQuarterEvolution() {
    return this.productionService.getQuarterEvolution()
  }

  @Get('check-vin/:vin')
  @ApiOperation({ summary: 'Verificar se VIN já foi registrado hoje' })
  checkVin(@Param('vin') vin: string) {
    return this.productionService.checkVin(vin)
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nova montagem' })
  async create(@Body() dto: CreateProductionDto) {
    const result = await this.productionService.create(dto)

    // Emit WebSocket events
    this.productionGateway.emitNewProduction(result.production)
    if (result.goalReached) {
      this.productionGateway.emitGoalReached()
    }

    return result.production
  }
}
