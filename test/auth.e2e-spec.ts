import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';

// Helper for generating unique emails to avoid collision
const uniqueEmail = () => `test-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let consoleLogSpy: jest.SpyInstance;

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
    
    // Silence console logs during tests to keep output clean
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(async () => {
    consoleLogSpy?.mockRestore();
    await prisma?.$disconnect();
    await app?.close();
  });

  // --- Helpers ---

  // Manually create a verified OTP in DB so we can bypass the email/sms step
  const createVerifiedOtp = async (value: string, type: OTPType, identifier: OTPIdentifier) => {
    await prisma.oTP.create({
      data: {
        value,
        type,
        identifier,
        otpCode: await hash('123456', 10), // Not actually used by register endpoint check, it just checks status & updated match
        status: 'VERIFIED',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 mins
        updatedAt: new Date(), // verified "now"
      }
    });
  };

  const createVerifiedUser = async (password = 'StrongPass123!') => {
    const email = uniqueEmail();
    const phone = uniquePhone();
    const passwordHash = await hash(password, 10);
    
    const userRole = await prisma.roles.findFirst({ where: { roleName: 'user' } });
    if (!userRole) throw new Error('Role "user" not found - seed db?');

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: 'Test',
        lastName: 'User',
        passwordHash,
        isActive: true,
        accountStatus: 'ACTIVE',
        UserRole: {
          create: { roleId: userRole.id }
        },
        UserTwoStepVerifications: {
          create: {
            methodType: 'EMAIL',
            methodDetail: 'OTP via Email',
            isEnabled: true,
            isPrimary: true
          }
        }
      }
    });

    return { user, email, phone, password };
  };

  // --- Tests ---

  describe('POST /auth/register', () => {
    it('should register successfully with valid data and verified OTP', async () => {
        const email = uniqueEmail();
        const phone = uniquePhone();
        
        // Prerequisites: Valid verified OTPs for both email and phone
        let rand = Math.floor(Math.random() * 1);
        if(rand === 0) {
            await createVerifiedOtp(email, 'ACCOUNT_VERIFICATION', 'EMAIL');
        } else {
            await createVerifiedOtp(phone, 'ACCOUNT_VERIFICATION', 'PHONE');
        }

        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
            email,
            phoneNumber: phone,
            firstName: 'John',
            lastName: 'Doe',
            password: 'StrongPassword123!',
            })
            .expect(201);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
        // Register no longer returns tokens, user has to login
        // expect(response.body.data).toHaveProperty('accessToken');
        // expect(response.body.data).toHaveProperty('refreshToken');

        // Verify DB
        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).toBeDefined();
        expect(user?.firstName).toBe('John');
    });

    it('should fail if email is not verified', async () => {
      const email = uniqueEmail();
      const phone = uniquePhone();

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          phoneNumber: phone,
          firstName: 'John',
          lastName: 'Doe',
          password: 'StrongPassword123!',
        })
        .expect(201); // Controller returns 201 even on error if service catches it

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Please verify your account first');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // We manually create a user but we also need "2FA verified OTP" if 2FA is enabled?
      // Our helper enables 2FA by default.
      // So login will trigger OTP check.
      const { email, password } = await createVerifiedUser();
      
      // Bypass 2FA check by pre-verifying OTP for TWO_FACTOR_AUTHENTICATION
      await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
          password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User successfully logged in');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail if 2FA is required but OTP missing/expired', async () => {
      const { email, password } = await createVerifiedUser();
      // We do NOT create OTP here. Login should fail or succeed?
      // AuthService logic: if (twoFactor) { ... if (!otp || ...) throw ... }
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
          password
        })
        .expect(200); // Controller returns 200 even on error if service catches it

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Please verify your account first');
    });

    it('should fail with invalid password', async () => {
      const { email } = await createVerifiedUser();

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'WrongPassword123!'
        })
        .expect(200); // Controller returns 200 even on error if service catches it
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message', 'Invalid credentials!!');
    });
  });

  describe('POST /auth/password/reset', () => {
    it('should reset password successfully', async () => {
      const { user, password, email } = await createVerifiedUser();
      
      // We need a valid token to access this route
      // To get token, we must login. To login, verify 2FA.
      await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');
      
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password });
      
      const token = loginRes.body.data.accessToken;

      const newPassword = 'NewStrongPassword123!';
      
      // The resetPassword logic also checks 2FA OTP "PASSWORD_RESET" if enabled.
      await createVerifiedOtp(email, 'PASSWORD_RESET', 'EMAIL');

      await request(app.getHttpServer())
        .post('/api/v1/auth/password/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: password,
          newPassword: newPassword
        })
        .expect(202)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });

      // Verify login with new password (and new 2FA OTP)
      await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');
      
      const loginResNew = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
          password: newPassword
        })
        .expect(200);

      expect(loginResNew.body).toHaveProperty('success', true);
    });
  });

  describe('POST /auth/recover', () => {
    it('should recover account successfully', async () => {
      const { email } = await createVerifiedUser('OldPass123!');
      const newPassword = 'RecoveredPassword123!';

      // recoverAccount checks OTP for "ACCOUNT_RECOVERY" if 2FA enabled
      await createVerifiedOtp(email, 'ACCOUNT_RECOVERY', 'EMAIL');

      await request(app.getHttpServer())
        .post('/api/v1/auth/recover')
        .send({
          value: email,
          newPassword: newPassword
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });

      // Verify login with new password
      await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');
      
      const loginResRecover = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
           email,
           password: newPassword
        })
        .expect(200);

      expect(loginResRecover.body).toHaveProperty('success', true);
    });
  });
  
  // Need to fix logic if Refresh Token Logic works properly
  // For now assuming Refresh Token (which uses same secret) can be used as Bearer token for JwtGuard
  
  describe('POST /auth/token/refresh', () => {
     it('should refresh token successfully using Refresh Token in Authorization Header', async () => {
      const { email, password } = await createVerifiedUser();
      await createVerifiedOtp(email, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL');

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password });
      
      const refreshToken = loginRes.body.data.refreshToken;
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/token/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);
        
       expect(response.body).toHaveProperty('success', true);
       expect(response.body.data).toHaveProperty('accessToken');
    });
  });
});
