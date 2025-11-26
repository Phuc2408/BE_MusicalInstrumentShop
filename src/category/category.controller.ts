import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiOkResponseData } from "src/common/decorators/swagger.decorator";
import { CategoryResponse } from "./dto/category.response.dto";

@ApiTags('Category')
@Controller('v1/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all categories' })
    @ApiOkResponseData([CategoryResponse])

    async getAllCategories(): Promise<CategoryResponse[]> {
        return this.categoryService.findAllCategories();
    }
}