import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Brand } from "./entities/brand.entity";
import { Controller, Get } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { ApiOkResponseData } from "src/common/decorators/swagger.decorator";
import { BrandResponse } from "./dto/getAllBrandRes.dto";

@ApiTags('Brand')
@Controller('v1/brands')
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all brands' })
    @ApiOkResponseData([BrandResponse])

    async getAllBrands(): Promise<BrandResponse[]> {
        return this.brandService.findAll();
    }
}