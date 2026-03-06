import {
  Injectable, NotFoundException, BadRequestException
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

const MAX_EMPLOYEES = 20

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.funcionario.findMany({
      orderBy: { nome: 'asc' },
    })
  }

  async findActive() {
    return this.prisma.funcionario.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    })
  }

  async findOne(id: number) {
    const emp = await this.prisma.funcionario.findUnique({ where: { id } })
    if (!emp) throw new NotFoundException(`Funcionário #${id} não encontrado`)
    return emp
  }

  async create(dto: CreateEmployeeDto) {
    const total = await this.prisma.funcionario.count()
    if (total >= MAX_EMPLOYEES) {
      throw new BadRequestException(`Limite de ${MAX_EMPLOYEES} funcionários atingido`)
    }
    return this.prisma.funcionario.create({ data: { nome: dto.nome } })
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id)
    return this.prisma.funcionario.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    return this.prisma.funcionario.delete({ where: { id } })
  }
}
