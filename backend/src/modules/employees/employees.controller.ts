import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { EmployeesService } from './employees.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários' })
  findAll() {
    return this.employeesService.findAll()
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar funcionários ativos' })
  findActive() {
    return this.employeesService.findActive()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Criar funcionário' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir funcionário' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id)
  }
}
