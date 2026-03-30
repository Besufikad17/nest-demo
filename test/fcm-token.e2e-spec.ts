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

// Helper for unique test data
const uniqueEmail = () => `fcm-test-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
const deviceInfoHeader = 'Mozilla/5.0 (Test Device 1.0)';

describe('FCM Token Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let user: any;

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
        forbidNonWhitelisted: true
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.fCMToken.deleteMany(); // Cleanup tokens
    if (user) {
        // Cleanup user if needed, though usually DB is reset or we rely on unique data
        // await prisma.user.delete({ where: { id: user.id } }); // Cascades often handle this, but explicit cleanup is good
    }
    await prisma.$disconnect();
    await app.close();
  });

  const createVerifiedOtp = async (value: string, type: OTPType, identifier: OTPIdentifier) => {
    await prisma.oTP.create({
      data: {
        value,
        type,
        identifier,
        otpCode: await hash('123456', 10),
        status: 'VERIFIED',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 mins
        updatedAt: new Date(), // verified "now"
      }
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

    user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: 'FCM',
        lastName: 'Tester',
        passwordHash,
        isActive: true,
        accountStatus: 'ACTIVE',
        userRoles: {
          create: { roleId: userRole.id }
        },
        userTwoStepVerifications: {
          create: {
            methodType: 'EMAIL',
            methodDetail: 'OTP via Email',
            isEnabled: true,
            isPrimary: true
          }
        },
      },
    });

    // Create a verified OTP for Two-Factor Authentication
    await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Device-Info', deviceInfoHeader)
      .send({
        email,
        password,
      })
      .expect(200);

    return loginResponse.body.data.accessToken;
  };

  it('should register a new FCM token', async () => {
    authToken = await createVerifiedUserAndLogin();
    
    const fcmToken = 'test-fcm-token-123';
    
    // Note: Controller path is 'fcm-token', method path is 'fcm-token/register'.
    // Combined path: /api/v1/fcm-token/fcm-token/register
    await request(app.getHttpServer())
      .post('/api/v1/fcm-token/fcm-token/register')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: fcmToken,
        // The DTO requires userId, but logic injects it.
        // If ValidationPipe whitelist=true, sending userId is allowed if in DTO.
        // If passing strict validation, we might need to send userId or fix DTO.
        // Let's try sending it to satisfy DTO, using the user's ID.
        userId: user.id
      })
      .expect(201); // Controller uses @HttpCode(HttpStatus.CREATED)

    // Verify in DB
    const storedToken = await prisma.fCMToken.findFirst({
        where: {
            token: fcmToken,
            userId: user.id
        }
    });
    
    expect(storedToken).toBeDefined();
    expect(storedToken.token).toBe(fcmToken);
  });

  it('should fail with 401 if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/fcm-token/fcm-token/register')
      .send({
        token: 'some-token',
        userId: 'some-uuid' 
      })
      .expect(401);
  });

  it('should fail with 400 if validation fails (missing token)', async () => {
     // Ensure we have a token
     if (!authToken) authToken = await createVerifiedUserAndLogin();

     await request(app.getHttpServer())
      .post('/api/v1/fcm-token/fcm-token/register')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userId: user.id
        // token missing
      })
      .expect(400); 
  });
});
