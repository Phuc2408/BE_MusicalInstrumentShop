import { applyDecorators, Type } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { BaseResponseDto } from '../types/common.type';

// ======================================================
// 1. SUCCESS RESPONSE (200 OK)
// ======================================================

/**
 * Dùng cho API trả về Data (VD: Login, Get Profile, Get List)
 * @param dataDto Class DTO của phần data (VD: AuthDataResponse, UserInfoResponse)
 */
export const ApiOkResponseData = <DataDto extends Type<unknown>>(
    dataDto: DataDto | [DataDto],
) => {
    // 1. Kiểm tra xem đầu vào có phải là mảng không (ví dụ: [BrandResponse])
    const isArray = Array.isArray(dataDto);

    // 2. Lấy ra Class chính (nếu là mảng thì lấy phần tử đầu tiên)
    const model = isArray ? (dataDto as [DataDto])[0] : (dataDto as DataDto);

    return applyDecorators(
        // Đăng ký model với Swagger để tạo schema ref
        ApiExtraModels(BaseResponseDto, model),

        ApiOkResponse({
            schema: {
                allOf: [
                    // Kế thừa các trường cơ bản (statusCode, message...) từ BaseResponseDto
                    { $ref: getSchemaPath(BaseResponseDto) },
                    {
                        properties: {
                            // Cấu hình field 'data' tùy theo là mảng hay object đơn
                            data: isArray
                                ? {
                                    type: 'array',
                                    items: { $ref: getSchemaPath(model) }, // Nếu là mảng
                                }
                                : {
                                    $ref: getSchemaPath(model), // Nếu là object đơn
                                },
                        },
                    },
                ],
            },
        }),
    );
};

/**
 * Dùng cho API chỉ trả về Message, không có Data (VD: Logout, Forgot Pass, Delete)
 * Data sẽ hiển thị là null
 */
export const ApiOkResponseMessage = (customMessage: string = 'Success') =>
    applyDecorators(
        ApiExtraModels(BaseResponseDto),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(BaseResponseDto) }, // 1. Lấy khung chuẩn (statusCode, message...)
                    {
                        properties: {
                            // 2. GHI ĐÈ example của field 'message'
                            message: {
                                type: 'string',
                                example: customMessage
                            },
                            // 3. Định nghĩa data là null
                            data: {
                                nullable: true,
                                example: null
                            },
                        },
                    },
                ],
            },
        }),
    );

// ======================================================
// 2. ERROR RESPONSE (4xx, 5xx)
// Cấu trúc khớp với ExceptionFilter: { statusCode, message, error, data: null }
// ======================================================

/**
 * 400 Bad Request
 * @param message Thông báo lỗi ví dụ (String hoặc Array String)
 */
export const ApiBadRequest = (message: string | string[] = 'Bad Request') => {
    return ApiResponse({
        status: 400,
        description: 'Bad Request',
        schema: {
            example: {
                statusCode: 400,
                message: message,
                error: 'Bad Request',
                data: null,
            },
        },
    });
};

/**
 * 401 Unauthorized
 * @param message Thông báo lỗi ví dụ
 */
export const ApiUnauthorized = (message: string = 'Unauthorized') => {
    return ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            example: {
                statusCode: 401,
                message: message,
                error: 'Unauthorized',
                data: null,
            },
        },
    });
};

/**
 * 403 Forbidden
 */
export const ApiForbidden = (message: string = 'Forbidden resource') => {
    return ApiResponse({
        status: 403,
        description: 'Forbidden',
        schema: {
            example: {
                statusCode: 403,
                message: message,
                error: 'Forbidden',
                data: null,
            },
        },
    });
};

/**
 * 404 Not Found
 */
export const ApiNotFound = (message: string = 'Not Found') => {
    return ApiResponse({
        status: 404,
        description: 'Not Found',
        schema: {
            example: {
                statusCode: 404,
                message: message,
                error: 'Not Found',
                data: null,
            },
        },
    });
};

/**
 * 500 Internal Server Error
 */
export const ApiInternalServerError = (message: string = 'Internal Server Error') => {
    return ApiResponse({
        status: 500,
        description: 'Internal Server Error',
        schema: {
            example: {
                statusCode: 500,
                message: message,
                error: 'Internal Server Error',
                data: null,
            },
        },
    });
};

export const ApiCreatedResponseData = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
    applyDecorators(
        ApiExtraModels(BaseResponseDto, dataDto),
        ApiCreatedResponse({ // Dùng ApiCreatedResponse thay vì ApiOkResponse
            description: 'The record has been successfully created.',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(BaseResponseDto) },
                    {
                        properties: {
                            statusCode: { example: 201 }, // Ghi đè example thành 201
                            data: { $ref: getSchemaPath(dataDto) },
                        },
                    },
                ],
            },
        }),
    );

export const ApiConflict = (message: string = 'Conflict') => {
    return ApiResponse({
        status: 409,
        description: 'Conflict',
        schema: {
            example: {
                statusCode: 409,
                message: message,
                error: 'Conflict',
                data: null,
            },
        },
    });
};