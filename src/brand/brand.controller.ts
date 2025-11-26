import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { ApiOkResponseData } from "src/common/decorators/swagger.decorator";
import { BrandResponseDTO } from "./dto/getAllBrandRes.dto";

@ApiTags('Brand')
@Controller('v1/brands')
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all brands' })
    @ApiOkResponseData([BrandResponseDTO])

    async getAllBrands(): Promise<BrandResponseDTO[]> {
        return this.brandService.findAll();
    }
}