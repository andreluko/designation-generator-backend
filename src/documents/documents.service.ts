import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, Brackets } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentCommentDto } from './dto/update-document-comment.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { ProductsService } from '../products/products.service';
import { StandardEnum } from '../types/standard.enum';
import { CustomGost34TypesService } from '../custom-gost34-types/custom-gost34-types.service';
import { ESPD_DOC_TYPES, ESKD_DOC_TYPES, GOST34_DOC_TYPES } from '../constants';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private documentsRepository: Repository<DocumentEntity>,
    private readonly productsService: ProductsService,
    private readonly customGost34TypesService: CustomGost34TypesService,
  ) {}

  private formatNumberForDesignation(numStr: string | undefined | null, digits: number, allowZeroPrefix: boolean = true): string {
    if (numStr === null || numStr === undefined || numStr.trim() === '') {
        return 'X'.repeat(digits > 0 ? digits : 2); // Default placeholder if not X.repeat(0)
    }
    // For parts like part numbers, which can be single digit "1", don't pad.
    // For revisions or sequence numbers, padding is usually desired.
    if (digits === 0) return numStr; // No padding or length check, use as is

    const parsed = parseInt(numStr, 10);
    if (isNaN(parsed)) {
        return 'X'.repeat(digits);
    }
    return allowZeroPrefix ? String(parsed).padStart(digits, '0') : String(parsed);
  }


  private async getStandardDocTypeName(standard: StandardEnum, code: string): Promise<string> {
    let docTypes: { code: string; name: string }[] = [];
    if (standard === StandardEnum.ESPD) docTypes = ESPD_DOC_TYPES;
    else if (standard === StandardEnum.ESKD) docTypes = ESKD_DOC_TYPES;
    else if (standard === StandardEnum.GOST34) {
        const customType = await this.customGost34TypesService.findOneByCode(code);
        if (customType) return customType.name;
        docTypes = GOST34_DOC_TYPES;
    }
    const found = docTypes.find(dt => dt.code === code);
    // Extract name part after " - " if present, otherwise full name
    return found ? (found.name.includes(" - ") ? found.name.substring(found.name.indexOf(" - ") + 3) : found.name) : code;
  }

  private async generateGost34DocSequenceNum(productId: string, docTypeCode: string): Promise<string> {
    // Find the document with the highest gost34DocSequenceNum for this product and docTypeCode
    const query = this.documentsRepository.createQueryBuilder("doc")
        .select("MAX(CAST(doc.gost34Details ->> 'gost34DocSequenceNum' AS INTEGER))", "max_seq")
        .where("doc.productId = :productId", { productId })
        .andWhere("doc.docTypeCode = :docTypeCode", { docTypeCode })
        .andWhere("doc.selectedStandard = :standard", { standard: StandardEnum.GOST34 });
    
    const result = await query.getRawOne();
    
    let nextNumber = 1;
    if (result && result.max_seq !== null) { // Check for null if no documents exist yet
        nextNumber = result.max_seq + 1;
    }

    if (nextNumber > 99) {
        throw new ConflictException(`Достигнут лимит порядковых номеров (99) для документа ${docTypeCode} продукта ${productId}.`);
    }
    return String(nextNumber).padStart(2, '0');
  }


  async create(createDocumentDto: CreateDocumentDto): Promise<DocumentEntity> {
    const product = await this.productsService.findOne(createDocumentDto.registeredProductId);
    // findOne throws NotFoundException if product doesn't exist

    if (product.standard !== createDocumentDto.selectedStandard) {
        throw new BadRequestException('Стандарт документа (selectedStandard в DTO) не соответствует стандарту выбранного продукта.');
    }

    const document = this.documentsRepository.create({
      productId: product.id,
      productNameSnapshot: product.productName, // Store product name at time of creation
      docTypeCode: createDocumentDto.docTypeCode,
      customDocName: createDocumentDto.customDocName,
      selectedStandard: product.standard, // Crucially, use the standard from the fetched product
      comment: createDocumentDto.comment,
      docTypeName: await this.getStandardDocTypeName(product.standard, createDocumentDto.docTypeCode),
    });

    let designation = '';

    try {
      switch (product.standard) {
        case StandardEnum.ESPD:
          if (!product.fullEspdBaseDesignation) throw new InternalServerErrorException('Базовое обозначение ЕСПД для продукта не сформировано.');
          if (!createDocumentDto.espdDetails) throw new BadRequestException('Детали ЕСПД (espdDetails) обязательны для этого стандарта.');
          const { espdSoftwareType, espdBaseDocRevision, espdDocNumberByType, espdDocPartNumber } = createDocumentDto.espdDetails;
          document.espdDetails = { espdSoftwareType, espdBaseDocRevision, espdDocNumberByType, espdDocPartNumber };
          const baseRev = this.formatNumberForDesignation(espdBaseDocRevision, 2);
          const docNumByType = this.formatNumberForDesignation(espdDocNumberByType, 2);
          const partNumEspd = espdDocPartNumber ? `-${this.formatNumberForDesignation(espdDocPartNumber, 0)}` : ''; // No padding for part number
          designation = `${product.fullEspdBaseDesignation}-${baseRev} ${document.docTypeCode} ${docNumByType}${partNumEspd}`;
          break;

        case StandardEnum.ESKD:
          if (!product.fullEskdBaseDesignation) throw new InternalServerErrorException('Базовое обозначение ЕСКД для продукта не сформировано.');
          // eskdDetails can be optional if all its fields are optional. Frontend might send empty {}
          const { eskdDocRevision, eskdDocPartNum } = createDocumentDto.eskdDetails || {};
          document.eskdDetails = { eskdDocRevision, eskdDocPartNum };
          const revEskd = eskdDocRevision ? `-${this.formatNumberForDesignation(eskdDocRevision, 2)}` : '';
          const partNumEskd = eskdDocPartNum ? `-${this.formatNumberForDesignation(eskdDocPartNum, 0)}` : '';
          designation = `${product.fullEskdBaseDesignation}${revEskd} ${document.docTypeCode}${partNumEskd}`;
          break;

        case StandardEnum.GOST34:
          if (!product.fullGost34BaseDesignation) throw new InternalServerErrorException('Базовое обозначение ГОСТ 34 для продукта не сформировано.');
          if (!createDocumentDto.gost34Details) throw new BadRequestException('Детали ГОСТ 34 (gost34Details) обязательны для этого стандарта.');
          
          const userSeqNumInput = createDocumentDto.gost34Details.gost34DocSequenceNumUserInput;
          const finalDocSeqNum = (userSeqNumInput && /^\d{2}$/.test(userSeqNumInput))
            ? userSeqNumInput
            : await this.generateGost34DocSequenceNum(product.id, document.docTypeCode);

          const { gost34RevisionNum, gost34PartNum, gost34MachineReadable } = createDocumentDto.gost34Details;
          document.gost34Details = { ...createDocumentDto.gost34Details, gost34DocSequenceNum: finalDocSeqNum };
          
          const revG34 = gost34RevisionNum ? `.${this.formatNumberForDesignation(gost34RevisionNum, 0)}` : '';
          const partNumG34 = gost34PartNum ? `-${this.formatNumberForDesignation(gost34PartNum, 0)}` : '';
          const machineR = gost34MachineReadable ? '.М' : '';
          designation = `${product.fullGost34BaseDesignation}.${document.docTypeCode}.${finalDocSeqNum}${revG34}${partNumG34}${machineR}`;
          break;
        default:
          throw new BadRequestException('Неподдерживаемый стандарт для присвоения обозначения документа.');
      }

      document.designation = designation.replace(/\s+/g, ' ').trim();
      
      const existingDesignation = await this.documentsRepository.findOne({ where: { designation: document.designation } });
      if (existingDesignation) {
        throw new ConflictException(`Обозначение "${document.designation}" уже существует.`);
      }

      return this.documentsRepository.save(document);

    } catch (error) {
      this.logger.error(`Ошибка при создании документа: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException || error instanceof InternalServerErrorException) throw error;
      if (error.code === '23505') { // PostgreSQL unique violation for designation
        throw new ConflictException(`Сгенерированное обозначение "${document.designation}" уже существует. Возможно, измените параметры или порядковый номер.`);
      }
      throw new InternalServerErrorException('Внутренняя ошибка сервера при присвоении обозначения документу.');
    }
  }

  async findAll(queryDto: DocumentQueryDto): Promise<{data: DocumentEntity[], total: number}> {
    const { standard, search, sortBy, sortOrder, productId, page = 1, limit = 10 } = queryDto;
    
    const queryBuilder = this.documentsRepository.createQueryBuilder('doc')
      .leftJoinAndSelect('doc.product', 'product') // Join with product
      .take(limit)
      .skip((page - 1) * limit);

    if (standard) {
      queryBuilder.andWhere('product.standard = :standard', { standard });
    }
    if (productId) {
      queryBuilder.andWhere('doc.productId = :productId', { productId });
    }
    if (search) {
      queryBuilder.andWhere(new Brackets(qb => {
        qb.where('doc.designation ILIKE :search', { search: `%${search}%` })
          .orWhere('doc.customDocName ILIKE :search', { search: `%${search}%` })
          .orWhere('doc.docTypeName ILIKE :search', { search: `%${search}%` })
          .orWhere('doc.comment ILIKE :search', { search: `%${search}%` })
          .orWhere('product.productName ILIKE :search', { search: `%${search}%` }); // Search in joined product name
      }));
    }

    const validSortFieldsDoc: (keyof DocumentEntity)[] = ['designation', 'productNameSnapshot', 'docTypeCode', 'docTypeName', 'customDocName', 'selectedStandard', 'assignmentDate', 'comment', 'createdAt'];
    // Sort by product name needs to use the alias 'product.productName'
    const effectiveSortBy = sortBy === 'productName' 
        ? 'product.productName' 
        : (sortBy && validSortFieldsDoc.includes(sortBy as keyof DocumentEntity) ? `doc.${sortBy}` : 'doc.assignmentDate');
    
    const effectiveSortOrder = (sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(effectiveSortBy, effectiveSortOrder, sortBy === 'assignmentDate' || !sortBy ? 'NULLS LAST' : undefined);


    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<DocumentEntity> {
    const document = await this.documentsRepository.findOne({ 
        where: { id }, 
        relations: ['product'] // Eagerly load the associated product
    });
    if (!document) {
      throw new NotFoundException(`Документ с ID "${id}" не найден.`);
    }
    return document;
  }

  async updateComment(id: string, updateDocumentCommentDto: UpdateDocumentCommentDto): Promise<DocumentEntity> {
    const document = await this.findOne(id);
    document.comment = (updateDocumentCommentDto.comment === null || updateDocumentCommentDto.comment === '')
                       ? null
                       : updateDocumentCommentDto.comment || document.comment;
    return this.documentsRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const result = await this.documentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Документ с ID "${id}" не найден для удаления.`);
    }
  }
}
