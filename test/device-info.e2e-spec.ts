process.env.RATE_LIMIT_MODE = 'monitor';
process.env.RATE_LIMIT_ENABLED_GROUPS = 'public,sensitive,read';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';

const uniqueEmail = () => `session-test-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

const primaryDeviceHeader = 'Mozilla/5.0 (Session Test Device 1.0)';
const secondaryDeviceHeader = 'Mozilla/5.0 (Session Test Device 2.0)';

describe('Device Info Module - Sessions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let accessToken: string;
  let userId: string;

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
    await prisma?.$disconnect();
    await app?.close();
  });

  const createVerifiedOtp = async (value: string, type: OTPType, identifier: OTPIdentifier) => {
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

  const createUserAndCreateTwoSessions = async () => {
    const email = uniqueEmail();
    const phone = uniquePhone();
    const password = 'StrongPass123!';
    const passwordHash = await hash(password, 10);

    const userRole = await prisma.roles.findFirst({ where: { roleName: 'user' } });
    if (!userRole) {
      throw new Error('Role "user" not found. Database seeding might be required.');
    }

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: 'Session',
        lastName: 'Tester',
        passwordHash,
        isActive: true,
        accountStatus: 'ACTIVE',
        userRoles: {
          create: { roleId: userRole.id },
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

    userId = user.id;

    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    const firstLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', primaryDeviceHeader)
      .send({ email, password })
      .expect(200);

    accessToken = firstLogin.body.data.accessToken;

    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', secondaryDeviceHeader)
      .send({ email, password })
      .expect(200);
  };

  beforeEach(async () => {
    if (!accessToken || !userId) {
      await createUserAndCreateTwoSessions();
    }
  });

  it('should return user sessions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/device-info/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Device-Info', primaryDeviceHeader)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Sessions fetched');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.every((session: any) => session.userId === userId)).toBe(true);
  });

  it('should remove a session by id', async () => {
    const sessionsResponse = await request(app.getHttpServer())
      .get('/api/v1/device-info/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Device-Info', primaryDeviceHeader)
      .expect(200);

    const sessions = sessionsResponse.body.data;
    expect(sessions.length).toBeGreaterThanOrEqual(1);

    const targetSessionId = sessions[0].id;

    const removeResponse = await request(app.getHttpServer())
      .delete(`/api/v1/device-info/session/${targetSessionId}/remove`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Device-Info', primaryDeviceHeader)
      .expect(200);

    expect(removeResponse.body.success).toBe(true);
    expect(removeResponse.body.message).toBe('Session removed.');

    const deletedSession = await prisma.deviceInfo.findUnique({
      where: { id: targetSessionId },
    });
    expect(deletedSession).toBeNull();
  });

  it('should return failure payload when trying to remove unknown session id', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/api/v1/device-info/session/${fakeId}/remove`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Device-Info', primaryDeviceHeader)
      .expect(200);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.message).toBe('Session not found!!');
  });

  it('should fail when device-info header is missing', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/device-info/sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
