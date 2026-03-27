import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { NotificationType } from 'generated/prisma/client';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';
import { RoleEnums } from 'src/user-role/enums/role.enum';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';

const uniqueEmail = (prefix = 'notif-settings') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;
const deviceInfoHeader = 'Mozilla/5.0 (Test Device 1.0)';

describe('Notification Settings Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createdUserIds: string[] = [];
  const createdOtpValues: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NotificationProcessor)
      .useValue({})
      .overrideProvider(INotificationService)
      .useValue({
        createNotification: async () => ({ message: 'Notification created' }),
        getNotifications: async () => [],
        getNotification: async () => null,
        updateNotification: async () => ({ message: 'Notification updated' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (createdOtpValues.length > 0) {
      await prisma.oTP.deleteMany({
        where: {
          value: { in: createdOtpValues },
        },
      });
    }

    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: createdUserIds },
        },
      });
    }

    await prisma?.$disconnect();
    await app?.close();
  });

  const createVerifiedOtp = async (value: string, type: OTPType, identifier: OTPIdentifier) => {
    createdOtpValues.push(value);

    await prisma.oTP.create({
      data: {
        value,
        type,
        identifier,
        otpCode: await hash('123456', 10),
        status: 'VERIFIED',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        updatedAt: new Date(),
      },
    });
  };

  const createAndLoginUser = async (roleName: RoleEnums = RoleEnums.USER) => {
    const email = uniqueEmail(roleName.toLowerCase());
    const phone = uniquePhone();
    const password = 'StrongPass123!';
    const passwordHash = await hash(password, 10);

    const role = await prisma.roles.findFirst({ where: { roleName } });
    if (!role) throw new Error(`Role "${roleName}" not found.`);

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: roleName,
        lastName: 'Tester',
        passwordHash,
        isActive: true,
        accountStatus: 'ACTIVE',
        userRoles: {
          create: { roleId: role.id },
        },
        userTwoStepVerifications: {
          create: {
            methodType: 'EMAIL',
            methodDetail: 'OTP via Email',
            isEnabled: true,
            isPrimary: true,
          },
        },
      },
    });

    createdUserIds.push(user.id);

    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', deviceInfoHeader)
      .send({ email, password })
      .expect(200);

    return { user, token: loginRes.body.data.accessToken };
  };

  describe('GET /user/notification/all', () => {
    it('should return notification settings for authenticated user', async () => {
      const { user, token } = await createAndLoginUser(RoleEnums.USER);

      await prisma.notificationSettings.createMany({
        data: [
          { userId: user.id, notificationType: NotificationType.EMAIL, isEnabled: true },
          { userId: user.id, notificationType: NotificationType.PUSH, isEnabled: false },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/user/notification/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(202);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.every((item: any) => item.userId === user.id)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/notification/all')
        .expect(401);
    });

    it('should return 403 for non-user role', async () => {
      const { token } = await createAndLoginUser(RoleEnums.ADMIN);

      await request(app.getHttpServer())
        .get('/api/v1/user/notification/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('PATCH /user/notification/:id', () => {
    it('should update notification setting for owner', async () => {
      const { user, token } = await createAndLoginUser(RoleEnums.USER);

      const setting = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          notificationType: NotificationType.SMS,
          isEnabled: true,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/user/notification/${setting.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Device-Info', deviceInfoHeader)
        .send({
          isEnabled: false,
          notificationType: NotificationType.SMS,
        })
        .expect(202);

      expect(response.body).toHaveProperty('success', true);

      const updated = await prisma.notificationSettings.findUnique({ where: { id: setting.id } });
      expect(updated?.isEnabled).toBe(false);
      expect(updated?.notificationType).toBe(NotificationType.SMS);
    });

    it('should return 400 when updating setting owned by another user', async () => {
      const owner = await createAndLoginUser(RoleEnums.USER);
      const other = await createAndLoginUser(RoleEnums.USER);

      const ownerSetting = await prisma.notificationSettings.create({
        data: {
          userId: owner.user.id,
          notificationType: NotificationType.EMAIL,
          isEnabled: true,
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/user/notification/${ownerSetting.id}`)
        .set('Authorization', `Bearer ${other.token}`)
        .set('Device-Info', deviceInfoHeader)
        .send({ isEnabled: false })
        .expect(400);
    });

    it('should return 400 for invalid payload', async () => {
      const { user, token } = await createAndLoginUser(RoleEnums.USER);

      const setting = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          notificationType: NotificationType.PUSH,
          isEnabled: true,
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/user/notification/${setting.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Device-Info', deviceInfoHeader)
        .send({ notificationType: 'INVALID_TYPE' })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      const { user } = await createAndLoginUser(RoleEnums.USER);

      const setting = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          notificationType: NotificationType.EMAIL,
          isEnabled: true,
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/user/notification/${setting.id}`)
        .set('Device-Info', deviceInfoHeader)
        .send({ isEnabled: false })
        .expect(401);
    });
  });
});
