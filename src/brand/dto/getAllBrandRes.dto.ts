import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseDTO {
    @ApiProperty({ example: 30 })
    id: number;

    @ApiProperty({ example: 'Aguilar' })
    name: string;

    @ApiProperty({ example: 'aguilar' })
    slug: string;

    @ApiProperty({ example: null, nullable: true })
    description: string | null;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' })
    created_at: Date;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' })
    updated_at: Date;
}