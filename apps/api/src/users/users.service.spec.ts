import { UsersService } from "./users.service";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "./entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { ConflictException } from "@nestjs/common";

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {

  });

  describe('findByEmail', () => {
    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('caio@example.com');

      expect(result).toBeNull();
    });

    it('should return the user when found', async () => {
      const user = {
        id: 1,
        name: "Caio",
        email: "caioexteckoetter@gmail.com"
      }

      mockRepository.findOne.mockResolvedValue(user)

      expect(service.findByEmail("caioexteckoetter@gmail.com"),).resolves.toEqual(user);
    });

    it('should normalize email to lowercase before searching', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.findByEmail('CAIOEXTECKOETTER@GMAIL.COM');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'caioexteckoetter@gmail.com' },
      });
    })
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'senha123abc';
      const hash = await bcrypt.hash(plainPassword, 10);

      const result = await service.comparePassword(plainPassword, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const correctPassword = 'senha123abc';
      const wrongPassword = 'outra_senha';
      const hash = await bcrypt.hash(correctPassword, 10);

      const result = await service.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a user when email does not exist', async () => {
      const dto = {
        email: 'caio@example.com',
        password: 'senha123abc',
        name: 'Caio',
      };

      const entityMontada = {
        email: dto.email,
        name: dto.name,
        passwordHash: 'qualquer_hash',
      };

      const userSalvo = {
        id: 'uuid-123',
        ...entityMontada,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(entityMontada);
      mockRepository.save.mockResolvedValue(userSalvo);

      const result = await service.create(dto);

      expect(result).toEqual(userSalvo);
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto = {
        email: 'caio@example.com',
        password: 'senha123abc',
        name: 'Caio',
      };

      mockRepository.findOne.mockResolvedValue({
        id: 'uuid-qualquer',
        email: 'caio@example.com',
        name: 'Caio',
      });

      await expect(service.create(dto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase before saving', async () => {
      const dto = {
        email: 'CAIO@EXAMPLE.COM',
        password: 'senha123abc',
        name: 'Caio',
      };

      const entityMontada = {
        email: 'caio@example.com',
        name: dto.name,
        passwordHash: 'qualquer_hash',
      };

      const userSalvo = {
        id: 'uuid-123',
        ...entityMontada,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(entityMontada);
      mockRepository.save.mockResolvedValue(userSalvo);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'caio@example.com',
        }),
      );

      expect(mockRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'CAIO@EXAMPLE.COM',
        }),
      );
    });

    it('should not persist raw password', async () => {
      const dto = {
        email: 'caio@example.com',
        password: 'senha123abc',
        name: 'Caio',
      };

      mockRepository.findOne.mockResolvedValue(null);

      mockRepository.create.mockImplementation((data) => data);

      mockRepository.save.mockImplementation(async (data) => ({
        id: 'uuid-123',
        ...data,
      }));

      await service.create(dto);

      const dataPassedToCreate =
        mockRepository.create.mock.calls[0][0];

      const dataPassedToSave =
        mockRepository.save.mock.calls[0][0];

      expect(dataPassedToCreate).not.toHaveProperty('password');

      expect(dataPassedToCreate).toHaveProperty('passwordHash');

      expect(dataPassedToCreate.passwordHash).not.toBe(
        dto.password,
      );

      expect(dataPassedToSave).not.toHaveProperty('password');

      expect(dataPassedToSave.passwordHash).not.toBe(
        dto.password,
      );
    });
  });
});
