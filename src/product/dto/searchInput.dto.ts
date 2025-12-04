import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchDto {
    @ApiPropertyOptional({
        name: 'q',
        description: 'Search keyword (Returns an empty list if left empty)',
        example: 'fender'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    q: string;
}