import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Brand } from "./entities/brand.entity";
import { Controller, Get } from "@nestjs/common";
import { BrandService } from "./brand.service";

@ApiTags('Brand')
@Controller('v1/brands')
export class BrandController {
    constructor(private brandService: BrandService) { }
    @Get()
    @ApiOperation({ summary: 'Get all brands' })
    @ApiResponse({
        status: 200,
        description: 'List of all brands',
        type: [Brand],
    })
    async getAllBrands(): Promise<Brand[]> {
        return this.brandService.findAll();
    }
}    