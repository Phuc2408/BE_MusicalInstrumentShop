import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'Page number (default: 1)',
        minimum: 1,
        default: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be greater than or equal to 1' })
    page: number = 1;

    @ApiPropertyOptional({
        example: 64,
        description: 'Items per page (default: 64)',
        minimum: 1,
        default: 64
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be greater than or equal to 1' })
    limit: number = 64;
}