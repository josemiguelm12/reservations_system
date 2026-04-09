import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ enum: ['CLIENT', 'PARTNER'], default: 'CLIENT' })
  @IsEnum(UserRole, { message: 'Role must be CLIENT or PARTNER' })
  @IsOptional()
  role?: 'CLIENT' | 'PARTNER';

  // ─── Partner-only fields ──────────────────────────────
  @ApiPropertyOptional({ example: 'Sport Center RD' })
  @ValidateIf((o) => o.role === 'PARTNER')
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Premium sports venue...' })
  @ValidateIf((o) => o.role === 'PARTNER')
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessDescription?: string;

  @ApiPropertyOptional({ example: '809-555-0101' })
  @ValidateIf((o) => o.role === 'PARTNER')
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Winston Churchill #45, Santo Domingo' })
  @ValidateIf((o) => o.role === 'PARTNER')
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}
