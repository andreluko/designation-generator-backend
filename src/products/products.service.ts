import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, Brackets } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductCommentDto } from './dto/update-product-comment.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { StandardEnum } from '../types/standard.enum';
import { ESPD_ORG_CODE_DEFAULT } from '../constants';
// import { DEFAULT_PRODUCT_SEQUENTIAL_PART_ESPD, DEFAULT_PRODUCT_SERIAL_NUM_ESKD, DEFAULT_SYSTEM_REG_NUM_GOST34 } from '../constants';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,
  ) {}

  // Helper to format sequential numbers. Ensure it's robust.
  private formatSequentialNumber(num: number, digits: number): string {
    return String(num).padStart(digits, '0');
  }

  // Generates next sequential part for a given product standard and context
  private async generateNextSequential(
    standard: StandardEnum,
    contextFields: Partial<ProductEntity>, // Fields defining the uniqueness scope, e.g., { espdClassifier: '01' }
    sequenceField: keyof ProductEntity, // Field holding the sequence, e.g., 'espdProductSequentialPart'
    digits: number
  ): Promise<string> {
    const lastProduct = await this.productsRepository.findOne({
      where: { standard, ...contextFields },
      order: { [sequenceField as string]: 'DESC' }, // Cast to string if TS complains about symbol
      select: [sequenceField]
    });

    let nextNum = 1;
    if (lastProduct && lastProduct[sequenceField]) {
      const lastNumStr = lastProduct[sequenceField] as string;
      if (lastNumStr && /^\d+$/.test(lastNumStr)) { // ensure it's a string of digits
        const lastNum = parseInt(lastNumStr, 10);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
    }
    if (nextNum.toString().length > digits) {
        throw new ConflictException(`Достигнут лимит порядковых номеров для ${String(sequenceField)} в данном контексте.`);
    }
    return this.formatSequentialNumber(nextNum, digits);
  }

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const { standard, productName } = createProductDto;

    // Check for existing product with the same name and standard
    const existingNameProduct = await this.productsRepository.findOne({ where: { productName, standard } });
    if (existingNameProduct) {
      throw new ConflictException(`Продукт с именем "${productName}" и стандартом "${standard}" уже существует.`);
    }

    const product = this.productsRepository.create(createProductDto);

    try {
      switch (standard) {
        case StandardEnum.ESPD:
          if (!createProductDto.espdClassifier) throw new BadRequestException('Классификатор ЕСПД (espdClassifier) обязателен.');
          product.espdClassifier = createProductDto.espdClassifier;
          product.espdProductSequentialPart = createProductDto.espdProductSequentialPartUserInput ||
            await this.generateNextSequential(standard, { espdClassifier: product.espdClassifier }, 'espdProductSequentialPart', 3);
          product.fullEspdBaseDesignation = `${ESPD_ORG_CODE_DEFAULT}.${product.espdClassifier.substring(0, 2)}${product.espdProductSequentialPart}`;
          break;
        case StandardEnum.ESKD:
          if (!createProductDto.eskdOrgCode || !createProductDto.eskdClassChar) throw new BadRequestException('Код организации (eskdOrgCode) и классификационная характеристика (eskdClassChar) обязательны для ЕСКД.');
          product.eskdOrgCode = createProductDto.eskdOrgCode;
          product.eskdClassChar = createProductDto.eskdClassChar;
          product.eskdBaseSerialNum = createProductDto.eskdBaseSerialNumUserInput ||
            await this.generateNextSequential(standard, { eskdOrgCode: product.eskdOrgCode, eskdClassChar: product.eskdClassChar }, 'eskdBaseSerialNum', 6);
          product.fullEskdBaseDesignation = `${product.eskdOrgCode}.${product.eskdClassChar}.${product.eskdBaseSerialNum}`;
          break;
        case StandardEnum.GOST34:
          if (!createProductDto.gost34OrgCode || !createProductDto.gost34ClassCode) throw new BadRequestException('Код организации (gost34OrgCode) и код класса (gost34ClassCode) обязательны для ГОСТ 34.');
          product.gost34OrgCode = createProductDto.gost34OrgCode;
          product.gost34ClassCode = createProductDto.gost34ClassCode;
          product.gost34SystemRegNum = createProductDto.gost34SystemRegNumUserInput ||
            await this.generateNextSequential(standard, { gost34OrgCode: product.gost34OrgCode, gost34ClassCode: product.gost34ClassCode }, 'gost34SystemRegNum', 3);
          product.fullGost34BaseDesignation = `${product.gost34OrgCode}.${product.gost34ClassCode}.${product.gost34SystemRegNum}`;
          break;
        default:
          // The error "Type 'CreateProductDto' is not assignable to type 'never'" on the 'exhaustiveCheck' line
          // indicates a type inference issue where 'standard' is perceived as 'CreateProductDto'.
          // Removing 'exhaustiveCheck' and using 'standard' directly in the error.
          this.logger.error(`Неподдерживаемый стандарт продукта достиг default case: ${String(standard)}`);
          throw new BadRequestException(`Неподдерживаемый стандарт продукта: ${String(standard)}`);
      }

      // Final check for designation uniqueness before saving
      const designationFieldMap: Record<StandardEnum, keyof ProductEntity | null > = {
        [StandardEnum.ESPD]: 'fullEspdBaseDesignation',
        [StandardEnum.ESKD]: 'fullEskdBaseDesignation',
        [StandardEnum.GOST34]: 'fullGost34BaseDesignation',
      };
      const designationField = designationFieldMap[standard];

      if (designationField && product[designationField]) {
          const whereClause: Partial<ProductEntity> = {};
          whereClause[designationField] = product[designationField] as any; // Type assertion
          const existingDesignationProduct = await this.productsRepository.findOne({ where: whereClause });
          if (existingDesignationProduct) {
              throw new ConflictException(`Сгенерированное базовое обозначение "${product[designationField]}" уже существует.`);
          }
      }

      return this.productsRepository.save(product);
    } catch (error) {
      this.logger.error(`Ошибка при создании продукта: ${error.message}`, error.stack);
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException(\`Продукт с такими уникальными параметрами (имя, обозначение) уже существует.\`);
      }
      throw new InternalServerErrorException('Ошибка при создании продукта: ' + error.message);
    }
  }

  async findAll(queryDto: ProductQueryDto): Promise<{ data: ProductEntity[]; total: number }> {
    const { standard, search, sortBy, sortOrder, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    if (standard) {
      queryBuilder.andWhere('product.standard = :standard', { standard });
    }
    if (search) {
      queryBuilder.andWhere(new Brackets(qb => {
        qb.where('product.productName ILIKE :search', { search: `%${search}%` })
          .orWhere('product.comment ILIKE :search', { search: `%${search}%` })
          .orWhere('product.fullEspdBaseDesignation ILIKE :search', { search: `%${search}%` })
          .orWhere('product.fullEskdBaseDesignation ILIKE :search', { search: `%${search}%` })
          .orWhere('product.fullGost34BaseDesignation ILIKE :search', { search: `%${search}%` });
      }));
    }

    // Handle sorting: ensure sortBy is a valid field of ProductEntity
    const validSortFields: (keyof ProductEntity)[] = ['productName', 'standard', 'registrationDate', 'comment', 'createdAt', 'updatedAt', 'fullEspdBaseDesignation', 'fullEskdBaseDesignation', 'fullGost34BaseDesignation'];
    const effectiveSortBy = sortBy && validSortFields.includes(sortBy as keyof ProductEntity) ? sortBy : 'registrationDate';
    const effectiveSortOrder = (sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`product.${String(effectiveSortBy)}`, effectiveSortOrder);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
        where: { id },
        relations: ['documents'] // Optionally load related documents
    });
    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден.`);
    }
    return product;
  }

  async updateComment(id: string, updateProductCommentDto: UpdateProductCommentDto): Promise<ProductEntity> {
    const product = await this.findOne(id); // findOne will throw NotFoundException if not found
    // If comment is explicitly set to null, or undefined/empty string (treat as clear)
    product.comment = (updateProductCommentDto.comment === null || updateProductCommentDto.comment === '')
                      ? null
                      : updateProductCommentDto.comment || product.comment; // Keep existing if new one is undefined
    return this.productsRepository.save(product);
  }

  async updateBitrixTaskId(id: string, bitrixTaskId: string): Promise<ProductEntity> {
    const product = await this.findOne(id);
    product.bitrixTaskId = bitrixTaskId;
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['documents'] });
    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден.`);
    }
    if (product.documents && product.documents.length > 0) {
      throw new ConflictException('Невозможно удалить продукт, так как к нему привязаны документы. Сначала удалите все связанные документы.');
    }
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      // This case should ideally be caught by findOne above, but as a safeguard:
      throw new NotFoundException(`Продукт с ID "${id}" не найден для удаления.`);
    }
  }
}
