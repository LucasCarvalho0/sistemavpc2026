import { IsString, IsInt, Length, Matches, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductionDto {
  @ApiProperty({ example: '1HGCM82633A123456' })
  @IsString()
  @Length(17, 17, { message: 'VIN deve ter exatamente 17 caracteres' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/i, { message: 'VIN contém caracteres inválidos' })
  vin: string

  @ApiProperty({ example: 'L3 (Exclusive)', enum: ['L3 (Exclusive)', 'L2 (Advanced)'] })
  @IsString()
  @IsIn(['L3 (Exclusive)', 'L2 (Advanced)'])
  versaoCarro: string

  @ApiProperty({ example: 1 })
  @IsInt()
  funcionarioId: number
}
