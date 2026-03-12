import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { getQueueToken } from '@nestjs/bullmq';
import { RoleEnums } from 'src/user-role/enums/role.enum';
import { NotificationType, NotificationStatus } from 'generated/prisma/client';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { BullBoardService } from 'src/bull-board/bull-board.service';

// Helper for unique test data
const uniqueEmail = () => `test-user-notif-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;

describe('Notification Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('notification'))
      .useValue({
        add: jest.fn(),
      })
      .overrideProvider(NotificationProcessor)
      .useValue({})
      .overrideProvider(BullBoardService)
      .useValue({
        onModuleInit: jest.fn(),
        mountTo: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      }),
    );
    await app.init();
    
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await app?.close();
  });

  // --- Helpers ---

  const createVerifiedOtp = async (
    target: { value?: string, userId?: string }, 
    type: OTPType, 
    identifier: OTPIdentifier = 'EMAIL'
  ) => {
    await prisma.oTP.create({
      data: {
        value: target.value || 'N/A',
        userId: target.userId,
        type,
        identifier,
        otpCode: await hash('123456', 10),
        status: 'VERIFIED',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 mins
        updatedAt: new Date(), 
      }
    });
  };

  const createAndLoginUser = async (roleName: RoleEnums = RoleEnums.USER) => {
    const email = uniqueEmail();
    const phone = uniquePhone();
    const password = 'StrongPass123!';
    const passwordHash = await hash(password, 10);
    
    // Ensure role exists
    const role = await prisma.roles.findFirst({ where: { roleName } });
    if (!role) throw new Error(`Role "${roleName}" not found`);

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: 'Test',
        lastName: roleName === RoleEnums.ADMIN ? 'Admin' : 'User',
        passwordHash,
        isActive: true,
        accountStatus: 'ACTIVE',
        userRoles: {
          create: { roleId: role.id }
        },
        userTwoStepVerifications: {
          create: {
            methodType: 'EMAIL',
            methodDetail: 'OTP via Email',
            isEnabled: true,
            isPrimary: true
          }
        }
      }
    });

    // Login logic demands verified 2FA OTP if enabled
    await createVerifiedOtp({ value: email }, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('device-info', 'test-device')
      .send({ email, password })
      .expect(200);

    return { 
      user, 
      accessToken: loginRes.body.data.accessToken, 
      email, 
      phone 
    };
  };

  const createNotificationForUser = async (userId: string, title = 'Test Notif', message = 'Hello') => {
      return await prisma.notification.create({
          data: {
              userId,
              type: NotificationType.EMAIL,
              title,
              message,
              status: NotificationStatus.SENT
          }
      });
  };

  // --- Tests ---

  describe('GET /notification/all', () => {
    it('should retrieve notifications for logged in user', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);
      
      // Seed some notifications
      await createNotificationForUser(user.id, 'User Notif 1');
      await createNotificationForUser(user.id, 'User Notif 2');

      const response = await request(app.getHttpServer())
        .get('/api/v1/notification/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('userId', user.id);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notification/all')
        .expect(401);
    });

    it('should support pagination (skip/take)', async () => {
        const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);
        
        // Create 5 notifs
        for (let i = 0; i < 5; i++) {
            await createNotificationForUser(user.id, `Paginated Notif ${i}`);
        }

        const response = await request(app.getHttpServer())
            .get('/api/v1/notification/all')
            .query({ take: 2, skip: 1 })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        
        expect(response.body.data.length).toBe(2);
    });
  });

  describe('GET /notification/:id', () => {
    it('should retrieve a specific notification details', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);
      const notif = await createNotificationForUser(user.id, 'Specific Notif');

      const response = await request(app.getHttpServer())
        .get(`/api/v1/notification/${notif.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(notif.id);
      expect(response.body.data.title).toBe('Specific Notif');
    });

    it('should return 400/404 if notification not found or belongs to another user', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);
      
      // Another user's notification
      const otherUserSetup = await createAndLoginUser(RoleEnums.USER);
      const otherNotif = await createNotificationForUser(otherUserSetup.user.id, 'Other User Notif');

      await request(app.getHttpServer())
        .get(`/api/v1/notification/${otherNotif.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400); // Controller throws 400 for not found (service returns null)
    });

    it('should return 400 for non-existent ID', async () => {
        const { accessToken } = await createAndLoginUser(RoleEnums.USER);
        const randomId = '00000000-0000-0000-0000-000000000000';

        await request(app.getHttpServer())
          .get(`/api/v1/notification/${randomId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(400);
    });
  });
});
