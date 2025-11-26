import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponse {
    @ApiProperty({ example: 3 })
    id: number;

    @ApiProperty({ example: 'Drums' })
    name: string;

    @ApiProperty({ example: 'drums' })
    slug: string;

    @ApiProperty({ example: null, nullable: true, description: 'ID of the parent category if exists' })
    parent_id: number | null;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' })
    created_at: Date;

    @ApiProperty({ example: '2025-11-23T03:36:16.082Z' })
    updated_at: Date;
}