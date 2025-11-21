import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Brand } from "./entities/brand.entity";
import { Controller, Get } from "@nestjs/common";
import { BrandService } from "./brand.service";

@ApiTags('Brand')
@Controller('v1/brands')
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all brands' })
    @ApiResponse({
        status: 200,
        description: 'Success - list of brands returned',
        type: [Brand],
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - invalid request parameters',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - authentication required or failed',
    })
    async getAllBrands(): Promise<Brand[]> {
        return this.brandService.findAll();
    }
}