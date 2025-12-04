import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiOkResponseData } from "src/common/decorators/swagger.decorator";
import { CategoryResponseDTO } from "./dto/category.response.dto";
@ApiTags('Category')
@Controller('v1/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all categories' })
    @ApiOkResponseData([CategoryResponseDTO])

    async getAllCategories(): Promise<CategoryResponseDTO[]> {
        return this.categoryService.findAllCategories();
    }
}