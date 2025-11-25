import { ApiProperty } from "@nestjs/swagger";

export interface BackendRes<T = any> {
    statusCode: number;
    message: string | string[];
    error?: string;
    data?: T;
}

export class BaseResponseDto<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Success' })
    message: string | string[];

    // Data sẽ được định nghĩa động (Generic)
    data: T;
}