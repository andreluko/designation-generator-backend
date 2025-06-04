import { Injectable, InternalServerErrorException, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProductEntity } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';

@Injectable()
export class Bitrix24Service {
  private readonly logger = new Logger(Bitrix24Service.name);
  private readonly webhookUrl: string;
  private readonly userFieldDesignationId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ProductsService)) // Handle circular dependency
    private readonly productsService: ProductsService,
  ) {
    this.webhookUrl = this.configService.get<string>('bitrix24.webhookUrl');
    this.userFieldDesignationId = this.configService.get<string>('bitrix24.userFieldDesignationId');

    if (!this.webhookUrl || !this.userFieldDesignationId) {
      this.logger.warn('Bitrix24 Webhook URL or User Field ID is not configured. Bitrix24 integration will not work.');
    }
  }

  async createTaskForProduct(
    product: ProductEntity,
    responsibleId?: number,
    projectId?: number,
  ): Promise<{ taskId: string; updatedProduct: ProductEntity }> {
    if (!this.webhookUrl || !this.userFieldDesignationId) {
      throw new InternalServerErrorException('Bitrix24 integration is not configured on the server.');
    }
    if (product.bitrixTaskId) {
        throw new BadRequestException(`Задача для продукта "${product.productName}" (ID задачи в Битрикс: ${product.bitrixTaskId}) уже создана.`);
    }

    const baseDesignation = product.fullEspdBaseDesignation || product.fullEskdBaseDesignation || product.fullGost34BaseDesignation || 'N/A';

    const taskData: any = {
      fields: {
        TITLE: `Продукт: ${product.productName} - ${baseDesignation}`,
        DESCRIPTION: `Детали продукта:\nНаименование: ${product.productName}\nСтандарт: ${product.standard}\nБазовое обозначение: ${baseDesignation}\nДата регистрации: ${new Date(product.registrationDate).toLocaleDateString('ru-RU')}\nКомментарий: ${product.comment || '- нет -'}`,
        [this.userFieldDesignationId]: baseDesignation,
      },
    };

    if (responsibleId) {
      taskData.fields.RESPONSIBLE_ID = responsibleId;
    }
    if (projectId) {
      taskData.fields.GROUP_ID = projectId;
    }
    
    const url = `${this.webhookUrl.replace(/\/$/, '')}/tasks.task.add.json`;

    try {
      this.logger.log(`Отправка запроса на создание задачи в Битрикс24: ${JSON.stringify(taskData)} на ${url}`);
      const response = await firstValueFrom(
        this.httpService.post(url, taskData)
      );

      this.logger.log(`Ответ от API Битрикс24: ${JSON.stringify(response.data)}`);

      if (response.data && response.data.result && response.data.result.task && response.data.result.task.id) {
        const bitrixTaskId = response.data.result.task.id.toString();
        this.logger.log(`Задача в Битрикс24 успешно создана с ID: ${bitrixTaskId}`);
        
        const updatedProduct = await this.productsService.updateBitrixTaskId(product.id, bitrixTaskId);
        return { taskId: bitrixTaskId, updatedProduct };
      } else {
        const errorMsg = response.data?.error_description || response.data?.error || 'Unknown error from Bitrix24 API';
        this.logger.error(`Не удалось создать задачу в Битрикс24: ${errorMsg}`, response.data);
        throw new InternalServerErrorException(`Ошибка API Битрикс24 при создании задачи: ${errorMsg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка при создании задачи в Битрикс24:', error.response?.data || error.message, error.stack);
      const errorMessage = error.response?.data?.error_description || error.response?.data?.error || error.message || 'Неизвестная ошибка';
      throw new InternalServerErrorException(`Не удалось создать задачу в Битрикс24: ${errorMessage}`);
    }
  }
}
