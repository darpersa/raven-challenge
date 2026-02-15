import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { MailboxService } from './mailbox.service';

global.fetch = jest.fn();

describe('MailboxService', () => {
  let service: MailboxService;
  let configService: jest.Mocked<ConfigService>;

  const mockResponse = {
    email: 'test@example.com',
    did_you_mean: '',
    user: 'test',
    domain: 'example.com',
    format_valid: true,
    mx_found: true,
    smtp_check: true,
    catch_all: false,
    role: false,
    disposable: false,
    free: false,
    score: 0.8,
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailboxService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailboxService>(MailboxService);
    configService = module.get(ConfigService);

    (global.fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key from config', () => {
      const mockGet = jest.fn().mockReturnValue('test-api-key');

      expect(mockGet).toHaveBeenCalledWith('MAILBOXLAYER_API_KEY');
    });

    it('should warn when API key is not configured', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockGet = jest.fn().mockReturnValue('');
      const mockConfigServiceLocal = {
        get: mockGet,
      } as any;

      new MailboxService(mockConfigServiceLocal);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'MAILBOXLAYER_API_KEY no está configurada en las variables de entorno',
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('validateEmail', () => {
    beforeEach(() => {
      configService.get.mockReturnValue('test-api-key');
      service = new MailboxService(configService);
    });

    it('should validate email successfully', async () => {
      const email = 'test@example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.validateEmail(email);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-api-key'),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(email)),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API key is not configured', async () => {
      configService.get.mockReturnValue('');
      const serviceWithoutKey = new MailboxService(configService);
      const email = 'test@example.com';
      await expect(serviceWithoutKey.validateEmail(email)).rejects.toThrow(
        HttpException,
      );
      await expect(serviceWithoutKey.validateEmail(email)).rejects.toThrow(
        'API Key de MailboxLayer no configurada',
      );
    });

    it('should throw error when API response is not ok', async () => {
      const email = 'test@example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });
      await expect(service.validateEmail(email)).rejects.toThrow(HttpException);
      await expect(service.validateEmail(email)).rejects.toThrow(
        'Error al validar el correo electrónico',
      );
    });

    it('should throw error when fetch fails', async () => {
      const email = 'test@example.com';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(service.validateEmail(email)).rejects.toThrow(HttpException);
      await expect(service.validateEmail(email)).rejects.toThrow(
        'Error al validar el correo electrónico',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should encode email properly in URL', async () => {
      const email = 'test+tag@example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await service.validateEmail(email);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%2Btag%40example.com'),
      );
    });
  });

  describe('getEmailDetails', () => {
    beforeEach(() => {
      configService.get.mockReturnValue('test-api-key');
      service = new MailboxService(configService);
    });

    it('should get email details successfully', async () => {
      const email = 'test@example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.getEmailDetails(email);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-api-key'),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(email)),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API key is not configured', async () => {
      configService.get.mockReturnValue('');
      const serviceWithoutKey = new MailboxService(configService);
      const email = 'test@example.com';
      await expect(serviceWithoutKey.getEmailDetails(email)).rejects.toThrow(
        HttpException,
      );
      await expect(serviceWithoutKey.getEmailDetails(email)).rejects.toThrow(
        'API Key de MailboxLayer no configurada',
      );
    });

    it('should throw error when API response is not ok', async () => {
      const email = 'test@example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });
      await expect(service.getEmailDetails(email)).rejects.toThrow(
        HttpException,
      );
      await expect(service.getEmailDetails(email)).rejects.toThrow(
        'Error al obtener detalles del correo electrónico',
      );
    });

    it('should throw error when fetch fails', async () => {
      const email = 'test@example.com';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Connection timeout'),
      );
      await expect(service.getEmailDetails(email)).rejects.toThrow(
        HttpException,
      );
      await expect(service.getEmailDetails(email)).rejects.toThrow(
        'Error al obtener detalles del correo electrónico',
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle special characters in email', async () => {
      const email = 'user.name+tag@sub.example.com';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await service.getEmailDetails(email);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(email)),
      );
    });
  });
});
