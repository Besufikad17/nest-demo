import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { authenticator } from 'otplib';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';

const uniqueEmail = () => `2fa-test-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;
const deviceInfoHeader = 'Mozilla/5.0 (Test Device 1.0)';

describe('User Two Step Verification Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let authToken: string;
  let userId: string;
  let userEmail: string;
  let primaryAuthenticatorMethodId: string;

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

    await prisma.$disconnect();
    await app.close();
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

  const createVerifiedUserAndLogin = async () => {
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
        firstName: 'TwoStep',
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

    createdUserIds.push(user.id);

    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', deviceInfoHeader)
      .send({
        email,
        password,
      })
      .expect(200);

    return {
      user,
      token: loginResponse.body.data.accessToken,
    };
  };

  it('should setup authenticated user', async () => {
    const result = await createVerifiedUserAndLogin();
    authToken = result.token;
    userId = result.user.id;
    userEmail = result.user.email;

    expect(authToken).toBeDefined();
    expect(userId).toBeDefined();
    expect(userEmail).toBeDefined();
  });

  it('should return 401 for protected route without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/add')
      .set('Device-Info', deviceInfoHeader)
      .send({
        methodType: 'EMAIL',
        methodDetail: 'OTP via Email',
        isPrimary: false,
        isEnabled: true,
      })
      .expect(401);
  });

  it('should add authenticator method as primary', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/add')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        methodType: 'AUTHENTICATOR',
        methodDetail: 'Authenticator app',
        isPrimary: true,
        isEnabled: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('qrCode');

    const createdMethod = await prisma.userTwoStepVerification.findFirst({
      where: {
        userId,
        methodType: 'AUTHENTICATOR',
        isPrimary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(createdMethod).toBeDefined();
    expect(createdMethod?.secret).toBeTruthy();

    primaryAuthenticatorMethodId = createdMethod!.id;
  });

  it('should get all 2FA methods for authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/2fa/all')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should get primary 2FA method by user email', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/2fa')
      .send({
        value: userEmail,
      })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('userId', userId);
    expect(response.body.data).toHaveProperty('isPrimary', true);
  });

  it('should verify valid authenticator code', async () => {
    const method = await prisma.userTwoStepVerification.findUnique({
      where: { id: primaryAuthenticatorMethodId },
    });

    expect(method?.secret).toBeTruthy();

    const twoFaCode = authenticator.generate(method!.secret!);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        twoFaCode,
      })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('valid', true);
  });

  it('should update 2FA method', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/auth/2fa/update/${primaryAuthenticatorMethodId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        isEnabled: true,
        isPrimary: true,
      })
      .expect(202);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should delete a secondary 2FA method', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/add')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        methodType: 'EMAIL',
        methodDetail: 'Backup email OTP',
        isPrimary: false,
        isEnabled: true,
      })
      .expect(201);

    const secondaryMethod = await prisma.userTwoStepVerification.findFirst({
      where: {
        userId,
        methodType: 'EMAIL',
        isPrimary: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(secondaryMethod).toBeDefined();

    const response = await request(app.getHttpServer())
      .delete(`/api/v1/auth/2fa/delete/${secondaryMethod!.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .expect(202);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should request passkey registration options', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/passkey/add/request')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .expect(202);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('challenge');
  });

  it('should return handled error for invalid passkey registration payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/passkey/add')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        response: {},
      })
      .expect(202);

    expect(response.body).toHaveProperty('success', false);
  });

  it('should request passkey verification options', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/passkey/verify/request')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .expect(202);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('challenge');
  });

  it('should return handled error for invalid passkey verification payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/passkey/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Device-Info', deviceInfoHeader)
      .send({
        response: {
          id: 'invalid-credential-id',
        },
      })
      .expect(202);

    expect(response.body).toHaveProperty('success', false);
  });
});
