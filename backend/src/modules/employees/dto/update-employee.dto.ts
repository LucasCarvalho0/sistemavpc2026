import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'Augusto Silva' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean
}
