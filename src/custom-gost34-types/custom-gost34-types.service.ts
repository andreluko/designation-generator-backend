import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomGost34TypeEntity } from './entities/custom-gost34-type.entity';
import { CreateCustomGost34TypeDto } from './dto/create-custom-gost34-type.dto';
import { UpdateCustomGost34TypeDto } from './dto/update-custom-gost34-type.dto';
import { GOST34_DOC_TYPES } from '../constants'; // To check against standard types

@Injectable()
export class CustomGost34TypesService {
  private readonly logger = new Logger(CustomGost34TypesService.name);

  constructor(
    @InjectRepository(CustomGost34TypeEntity)
    private customTypesRepository: Repository<CustomGost34TypeEntity>,
  ) {}

  async create(createDto: CreateCustomGost34TypeDto): Promise<CustomGost34TypeEntity> {
    const code = createDto.code.toUpperCase(); // Always store and check uppercase
    
    // Check if code already exists in standard GOST 34 types
    if (GOST34_DOC_TYPES.some(stdType => stdType.code.toUpperCase() === code)) {
      throw new ConflictException(`Код "${code}" уже используется стандартным типом документа ГОСТ 34.`);
    }

    const existingCustomType = await this.customTypesRepository.findOne({ where: { code } });
    if (existingCustomType) {
      throw new ConflictException(`Пользовательский тип документа с кодом "${code}" уже существует.`);
    }

    const customType = this.customTypesRepository.create({ ...createDto, code }); // Store uppercase code
    try {
        return await this.customTypesRepository.save(customType);
    } catch (error) {
        this.logger.error(`Ошибка при создании пользовательского типа ГОСТ 34: ${error.message}`, error.stack);
        if (error.code === '23505') { // Unique constraint violation
            throw new ConflictException(`Пользовательский тип документа с кодом "${code}" уже существует (ошибка БД).`);
        }
        throw error; // Re-throw other errors
    }
  }

  async findAll(): Promise<CustomGost34TypeEntity[]> {
    return this.customTypesRepository.find({ order: { code: 'ASC' } });
  }

  async findOne(id: string): Promise<CustomGost34TypeEntity> {
    const customType = await this.customTypesRepository.findOne({ where: { id } });
    if (!customType) {
      throw new NotFoundException(`Пользовательский тип ГОСТ 34 с ID "${id}" не найден.`);
    }
    return customType;
  }
  
  async findOneByCode(code: string): Promise<CustomGost34TypeEntity | null> {
    const customType = await this.customTypesRepository.findOne({ where: { code: code.toUpperCase() } });
    return customType || null;
  }

  async update(id: string, updateDto: UpdateCustomGost34TypeDto): Promise<CustomGost34TypeEntity> {
    const customType = await this.findOne(id); // Ensures it exists
    
    if (updateDto.name !== undefined) {
        customType.name = updateDto.name;
    }
    // Code is generally not updatable.
    
    return this.customTypesRepository.save(customType);
  }

  async remove(id: string): Promise<void> {
    // TODO: Before deleting, check if this custom type is used in any DocumentEntity.
    // This requires injecting or accessing DocumentRepository/Service.
    // For now, direct delete:
    // const documentsUsingType = await this.documentRepository.count({ where: { docTypeCode: customType.code, selectedStandard: StandardEnum.GOST34 }});
    // if (documentsUsingType > 0) throw new ConflictException('Cannot delete type, it is used by documents.');
    const result = await this.customTypesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользовательский тип ГОСТ 34 с ID "${id}" не найден для удаления.`);
    }
  }
}
