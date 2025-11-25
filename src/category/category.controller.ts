import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Category } from "./entities/category.entity";

@ApiTags('Category')
@Controller('v1/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of all categories' })
    @ApiResponse({
        status: 200,
        description: 'List of all categories',
        type: [Category],
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid query or parameters',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - missing or invalid authentication',
    })
    async getAllCategories(): Promise<Category[]> {
        return this.categoryService.findAllCategories();
    }
}