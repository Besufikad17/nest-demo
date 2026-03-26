import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';
import { OTPIdentifier, OTPType, UserActions } from 'generated/prisma/enums';
import { RoleEnums } from 'src/user-role/enums/role.enum';

// Helper for unique test data
const uniqueEmail = (prefix = 'user') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const uniquePhone = () => `+555${Date.now().toString().slice(-9)}`;
const deviceInfoHeader = 'Mozilla/5.0 (Test Device 1.0)';

describe('User Activity Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Test users
  let standardUser: any;
  let standardUserToken: string;
  let adminUser: any;
  let adminUserToken: string;
  let activityId: string;

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
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Setup Roles if missing (though usually seeded)
    // We assume they exist as per previous tests
  });

  afterAll(async () => {
    // Cleanup
    await prisma.userActivityLog.deleteMany();
    if (formattedUsers.length > 0) {
        await prisma.user.deleteMany({
            where: {
                id: { in: formattedUsers }
            }
        })
    }
    await prisma.$disconnect();
    await app.close();
  });

  const formattedUsers: string[] = [];

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
      }
    });
  };

  const createUserWithRole = async (roleName: string, prefix: string) => {
    const email = uniqueEmail(prefix);
    const phone = uniquePhone();
    const password = 'StrongPass123!';
    const passwordHash = await hash(password, 10);

    const userRole = await prisma.roles.findFirst({ where: { roleName } });
    if (!userRole) throw new Error(`Role "${roleName}" not found.`);

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber: phone,
        firstName: prefix,
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
    formattedUsers.push(user.id);

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

    return { user, token: loginResponse.body.data.accessToken };
  };

  it('should setup users', async () => {
      const standard = await createUserWithRole('user', 'std');
      standardUser = standard.user;
      standardUserToken = standard.token;

      const admin = await createUserWithRole('admin', 'adm');
      adminUser = admin.user;
      adminUserToken = admin.token;
  });

  it('should seed user activity', async () => {
      const activity = await prisma.userActivityLog.create({
          data: {
              userId: standardUser.id,
              action: UserActions.LOGIN_WITH_EMAIL,
              actionTimestamp: new Date(),
          }
      });
      activityId = activity.id;
  });

  describe('GET /user/activity/all', () => {
      it('should return activities for logged in user', async () => {
          const response = await request(app.getHttpServer())
              .get('/api/v1/user/activity/all')
              .set('Authorization', `Bearer ${standardUserToken}`)
              .send({
                  // Empty filter or specific filter
                  action: UserActions.LOGIN_WITH_EMAIL
              })
              .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data.length).toBeGreaterThan(0);
          expect(response.body.data[0].userId).toBe(standardUser.id);
          // Check that fetched activity matches seeded one
          const found = response.body.data.find((a: any) => a.id === activityId);
          expect(found).toBeDefined();
      });

      it('should filter by action', async () => {
         // Create another activity with different action
         await prisma.userActivityLog.create({
            data: {
                userId: standardUser.id,
                action: UserActions.FILE_UPLOAD, // Different action
                actionTimestamp: new Date(),
            }
        });

        const response = await request(app.getHttpServer())
            .get('/api/v1/user/activity/all')
            .set('Authorization', `Bearer ${standardUserToken}`)
            .send({
                action: UserActions.LOGIN_WITH_EMAIL
            })
            .expect(200);
        
        // Should only return LOGIN_WITH_EMAIL
        expect(response.body.data.every((a: any) => a.action === UserActions.LOGIN_WITH_EMAIL)).toBe(true);
      });
      
      it('should support pagination (skip/take)', async () => {
         const response = await request(app.getHttpServer())
            .get('/api/v1/user/activity/all?take=1&skip=0')
            .set('Authorization', `Bearer ${standardUserToken}`)
            .send({})
            .expect(200);
         
         expect(response.body.data.length).toBe(1);
      });
  });

  describe('GET /user/activity/:id', () => {
      it('should return specific activity for user', async () => {
          const response = await request(app.getHttpServer())
              .get(`/api/v1/user/activity/${activityId}`)
              .set('Authorization', `Bearer ${standardUserToken}`)
              .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data.id).toBe(activityId);
      });

      it('should return null (or success with null data) if activity belongs to other user', async () => {
          // Admin has no activity yet, or create one for admin
          const adminActivity = await prisma.userActivityLog.create({
            data: {
                userId: adminUser.id,
                action: UserActions.LOGIN_WITH_EMAIL,
                actionTimestamp: new Date(),
            }
          });

          const response = await request(app.getHttpServer())
              .get(`/api/v1/user/activity/${adminActivity.id}`)
              .set('Authorization', `Bearer ${standardUserToken}`) // Standard user tries to access admin's activity
              .expect(200); // Controller returns 200 with data: null usually if logic uses findFirst() and returns null
          
          expect(response.body.data).toBeNull();
      });
  });

  describe('GET /user/activity/admin/all', () => {
      it('should allow admin to fetch all activities', async () => {
          const response = await request(app.getHttpServer())
              .get('/api/v1/user/activity/admin/all')
              .set('Authorization', `Bearer ${adminUserToken}`)
              .send({})
              .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      });

      it('should allow admin to filter by user', async () => {
          const response = await request(app.getHttpServer())
              .get(`/api/v1/user/activity/admin/all?user=${standardUser.id}`)
              .set('Authorization', `Bearer ${adminUserToken}`)
              .send({})
              .expect(200);

          expect(response.body.data.every((a: any) => a.userId === standardUser.id)).toBe(true);
      });

      it('should forbid standard user', async () => {
          await request(app.getHttpServer())
              .get('/api/v1/user/activity/admin/all')
              .set('Authorization', `Bearer ${standardUserToken}`)
              .send({})
              .expect(403);
      });
  });

  describe('GET /user/activity/admin/:id', () => {
       it('should allow admin to fetch any activity', async () => {
           const response = await request(app.getHttpServer())
               .get(`/api/v1/user/activity/admin/${activityId}`) // standard user activity
               .set('Authorization', `Bearer ${adminUserToken}`)
               .expect(200);
           
           expect(response.body.data.id).toBe(activityId);
       });

       it('should forbid standard user', async () => {
          await request(app.getHttpServer())
               .get(`/api/v1/user/activity/admin/${activityId}`)
               .set('Authorization', `Bearer ${standardUserToken}`)
               .expect(403);
       });
  });
});
