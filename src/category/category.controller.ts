import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Category } from "./entities/category.entity";

@ApiTags('Category')
@Controller('v1/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }
    @Get()
        @ApiOperation({ summary: 'Get all brands' })
        @ApiResponse({
            status: 200,
            description: 'List of all categories',
            type: [Category],
        })
        async getAllBrands(): Promise<Category[]> {
            return this.categoryService.findAllCategories();
        }
}