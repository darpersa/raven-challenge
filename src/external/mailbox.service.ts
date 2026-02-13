import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface MailboxLayerResponse {
  email: string;
  did_you_mean: string;
  user: string;
  domain: string;
  format_valid: boolean;
  mx_found: boolean;
  smtp_check: boolean;
  catch_all: boolean;
  role: boolean;
  disposable: boolean;
  free: boolean;
  score: number;
}

@Injectable()
export class MailboxService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://apilayer.net/api/check';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MAILBOXLAYER_API_KEY') || '';
    if (!this.apiKey) {
      console.warn(
        'MAILBOXLAYER_API_KEY no está configurada en las variables de entorno',
      );
    }
  }

  async validateEmail(email: string): Promise<MailboxLayerResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'API Key de MailboxLayer no configurada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const url = `${this.apiUrl}?access_key=${this.apiKey}&email=${encodeURIComponent(email)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          'Error al validar el email con MailboxLayer',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data: MailboxLayerResponse = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error validando email:', error);
      throw new HttpException(
        'Error al validar el correo electrónico',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEmailDetails(email: string): Promise<MailboxLayerResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'API Key de MailboxLayer no configurada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const url = `${this.apiUrl}?access_key=${this.apiKey}&email=${encodeURIComponent(email)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          'Error al consultar MailboxLayer',
          HttpStatus.BAD_GATEWAY,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo detalles del email:', error);
      throw new HttpException(
        'Error al obtener detalles del correo electrónico',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
