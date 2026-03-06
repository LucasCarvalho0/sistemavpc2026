import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { EmployeesModule } from './modules/employees/employees.module'
import { ProductionModule } from './modules/production/production.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmployeesModule,
    ProductionModule,
  ],
})
export class AppModule {}
