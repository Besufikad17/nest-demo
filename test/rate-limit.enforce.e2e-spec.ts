process.env.RATE_LIMIT_MODE = 'enforce';
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

const uniqueEmail = (prefix = 'rl-enforce') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
const deviceInfoHeader = 'Mozilla/5.0 (Rate Limit Enforce Test Device)';
const uniqueIp = () => `10.200.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200) + 1}`;

describe('Rate Limit (enforce) (e2e)', () => {
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
        where: { value: { in: createdOtpValues } },
      });
    }

    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
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

  const createVerifiedUser = async (password = 'StrongPass123!') => {
    const email = uniqueEmail('rl-user');
    const phone = uniquePhone();
    const passwordHash = await hash(password, 10);

    const userRole = await prisma.roles.findFirst({ where: { roleName: 'user' } });
    if (!userRole) throw new Error('Role "user" not found - seed db?');

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: 'Rate',
        lastName: 'Limit',
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

    return { user, email, phone, password };
  };

  it('should return 429 with retryAfter for repeated failed login attempts', async () => {
    const { email } = await createVerifiedUser();
    const ip = uniqueIp();

    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Device-Info', deviceInfoHeader)
        .set('X-Forwarded-For', ip)
        .send({
          email,
          password: 'WrongPassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
    }

    const blocked = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', deviceInfoHeader)
      .set('X-Forwarded-For', ip)
      .send({
        email,
        password: 'WrongPassword123!',
      })
      .expect(429);

    expect(['RATE_LIMIT_EXCEEDED', 'RATE_LIMIT_BLOCKED']).toContain(blocked.body.code);
    expect(typeof blocked.body.retryAfter).toBe('number');
    expect(blocked.body.retryAfter).toBeGreaterThan(0);
  });

  it('should return 429 with retryAfter for otp request after threshold', async () => {
    const email = uniqueEmail('rl-otp-request');
    const ip = uniqueIp();

    for (let i = 0; i < 3; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/otp/request')
        .set('X-Forwarded-For', ip)
        .send({
          type: 'ACCOUNT_VERIFICATION',
          identifier: 'EMAIL',
          value: email,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    }

    const blocked = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .set('X-Forwarded-For', ip)
      .send({
        type: 'ACCOUNT_VERIFICATION',
        identifier: 'EMAIL',
        value: email,
      })
      .expect(429);

    expect(blocked.body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
    expect(typeof blocked.body.retryAfter).toBe('number');
    expect(blocked.body.retryAfter).toBeGreaterThan(0);
  });

  it('should return 429 with retryAfter for 2fa verify after threshold', async () => {
    const { email, password } = await createVerifiedUser();
    const loginIp = uniqueIp();
    const verifyIp = uniqueIp();

    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', `${deviceInfoHeader}-2fa-login`)
      .set('X-Forwarded-For', loginIp)
      .send({ email, password })
      .expect(200);

    const token = loginResponse.body.data.accessToken;
    expect(token).toBeDefined();

    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/2fa/verify')
        .set('Authorization', `Bearer ${token}`)
        .set('Device-Info', deviceInfoHeader)
        .set('X-Forwarded-For', verifyIp)
        .send({ twoFaCode: '000000' })
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
    }

    const blocked = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/verify')
      .set('Authorization', `Bearer ${token}`)
      .set('Device-Info', deviceInfoHeader)
      .set('X-Forwarded-For', verifyIp)
      .send({ twoFaCode: '000000' })
      .expect(429);

    expect(['RATE_LIMIT_EXCEEDED', 'RATE_LIMIT_BLOCKED']).toContain(blocked.body.code);
    expect(typeof blocked.body.retryAfter).toBe('number');
    expect(blocked.body.retryAfter).toBeGreaterThan(0);
  });
});
