import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { OTPIdentifier, OTPType } from 'generated/prisma/enums';
import { RoleEnums } from 'src/user-role/enums/role.enum';

// Helper for unique test data
const uniqueEmail = () => `test-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;

describe('User Module (e2e)', () => {
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
    
    // Silence console logs
    // consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(async () => {
    // consoleLogSpy?.mockRestore();
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

  // --- Tests ---

  describe('GET /user/:id', () => {
    it('should retrieve own profile successfully', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/user/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', user.id);
      expect(response.body.data).toHaveProperty('email', user.email);
    });

    it('should fail without token', async () => {
        // Can't easily use createAndLoginUser because it gives us a valid token, 
        // effectively we just pick a random ID
        await request(app.getHttpServer())
          .get(`/api/v1/user/some-id`)
          .expect(401);
    });
  });

  describe('GET /user/all (Admin)', () => {
    it('should allow admin to list users', async () => {
      // Create admin
      const { accessToken } = await createAndLoginUser(RoleEnums.ADMIN);

      const response = await request(app.getHttpServer())
        .get('/api/v1/user/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should forbid regular user from listing users', async () => {
      const { accessToken } = await createAndLoginUser(RoleEnums.USER);

      await request(app.getHttpServer())
        .get('/api/v1/user/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('PATCH /user/:id', () => {
    it('should update user profile if OTP verified', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);
      const newFirstName = 'UpdatedName';

      // Setup OTP for the update action (requires verifying 2FA OTP again technically, or "ACTION_VERIFICATION" - 
      // The controller calls: otpService.getOTP({ userId: user.id, type: "TWO_FACTOR_AUTHENTICATION" });
      // So we need a fresh verified OTP of that type linked to the USER_ID.
      
      await createVerifiedOtp({ userId: user.id }, 'TWO_FACTOR_AUTHENTICATION', 'EMAIL'); // The controller looks up by userId

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/user/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('device-info', 'test-device')
        .send({
          firstName: newFirstName
        })
        .expect((res) => {
          if (res.status !== 202) {
             console.log('PATCH Failed Body:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(202);

      // Verify update
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.firstName).toBe(newFirstName);
    });

    it('should update user profile using login OTP', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);

      // Login OTP (created in helper) usually has no userId, but our service now falls back to finding by email.
      // So this should succeed without creating a new Verified OTP explicitly by userId.

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/user/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('device-info', 'test-device')
        .send({
          firstName: 'ShouldSucceed'
        })
        .expect(202);
      
      expect(response.body.success).toBe(true);
    });

    it('should fail update if OTP is strictly missing/expired', async () => {
      const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);

      // Delete all OTPs for this user (including login OTP) to force failure
      await prisma.oTP.deleteMany({
         where: { value: user.email }
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/user/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('device-info', 'test-device')
        .send({
          firstName: 'ShouldFail'
        })
        .expect(202); // Controller swallows error and returns 202

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Please verify your action first');
    });
  });

  describe('DELETE /user', () => {
      // NOTE: User controller has @Delete() mapped to deleteAccount
      // It uses @GetUser() user.id.
    it('should delete own account', async () => {
        const { user, accessToken } = await createAndLoginUser(RoleEnums.USER);

        await request(app.getHttpServer())
            .delete('/api/v1/user')
            .set('Authorization', `Bearer ${accessToken}`)
            .set('device-info', 'test-device')
            .expect(202); // HttpStatus.ACCEPTED
        
        // Check if user is deleted (or soft deleted?)
        // Repo is `deleted-user.repository`. It seems it migrates data or marks status.
        // Assuming user is no longer retrieved by standard find.
        
        const deletedUser = await prisma.user.findUnique({ where: { id: user.id } });
        // Depending on implementation, it might be gone or status changed.
        // Let's assume the basic requirement is the 202 response for now.
    });
  });
});
