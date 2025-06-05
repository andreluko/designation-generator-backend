import {
  Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentCommentDto } from './dto/update-document-comment.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DocumentEntity } from './entities/document.entity';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a designation to a new document' })
  @ApiResponse({ status: 201, description: 'Document designation assigned successfully.', type: DocumentEntity })
  @ApiResponse({ status: 400, description: 'Bad Request (validation error or product standard mismatch).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Registered product not found.' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., designation already exists or sequence limit reached).' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDocumentDto: CreateDocumentDto): Promise<DocumentEntity> {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assigned document designations with filtering, sorting, and pagination' })
  @ApiQuery({ name: 'standard', required: false, enum: ['ЕСПД', 'ЕСКД', 'ГОСТ 34'] })
  @ApiQuery({ name: 'productId', required: false, type: String, description: 'Filter by product ID (UUID format)'})
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'e.g., designation, productNameSnapshot, assignmentDate' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc', 'ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of assigned documents.', 
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DocumentEntity' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query() queryDto: DocumentQueryDto): Promise<{data: DocumentEntity[], total: number}> {
    return this.documentsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific assigned document designation by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Document details.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentEntity> {
    return this.documentsService.findOne(id);
  }

  @Put(':id/comment')
  @ApiOperation({ summary: 'Update comment for an assigned document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully.', type: DocumentEntity })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentCommentDto: UpdateDocumentCommentDto,
  ): Promise<DocumentEntity> {
    return this.documentsService.updateComment(id, updateDocumentCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assigned document designation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.documentsService.remove(id);
  }
}
