import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'src/common/utils/hash.utils';
import { INotificationService } from 'src/notification/interfaces';
import { NotificationProcessor } from 'src/notification/processors/notification.processor';

describe('OtpController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let consoleLogSpy: jest.SpyInstance;

	const uniqueEmail = () => `user-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

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
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterAll(async () => {
		consoleLogSpy?.mockRestore();
		await prisma?.$disconnect();
		await app?.close();
	});

	const requestEmailOtpAndSeedKnownCode = async (
		email: string,
		knownCode: string,
		otpType: 'ACCOUNT_VERIFICATION' | 'ACCOUNT_RECOVERY' | 'TWO_FACTOR_AUTHENTICATION' | 'PASSWORD_RESET' =
			'ACCOUNT_VERIFICATION',
	) => {
		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/request')
			.send({
				type: otpType,
				identifier: 'EMAIL',
				value: email,
			})
			.expect(201);

		const latestOtp = await prisma.oTP.findFirst({
			where: { value: email, type: otpType },
			orderBy: { createdAt: 'desc' },
		});
		expect(latestOtp).toBeTruthy();

		await prisma.oTP.update({
			where: { id: latestOtp!.id },
			data: { otpCode: await hash(knownCode, 10) },
		});
	};

	it('/auth/otp/request (POST)', async () => {
		const otpRequestReponse = await request(app.getHttpServer())
			.post('/api/v1/auth/otp/request')
			.send({
				type: 'ACCOUNT_VERIFICATION',
				identifier: 'EMAIL',
				value: 'besumicheal@gmail.com',
			})
			.expect(201);

		expect(otpRequestReponse.body).toEqual(
			expect.objectContaining({
				message: 'Verification code sent',
			}),
		);
	});

	it('/auth/otp/request (POST) rejects invalid enum', async () => {
		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/request')
			.send({
				type: 'NOT_A_REAL_TYPE',
				identifier: 'EMAIL',
				value: uniqueEmail(),
			})
			.expect(400);
	});

	it('/auth/otp/validate (POST) fails for wrong code then succeeds with correct code', async () => {
		const email = uniqueEmail();
		const code = '123456';
		await requestEmailOtpAndSeedKnownCode(email, code);

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: '000000',
			})
			.expect(400);

		const validateResponse = await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: code,
			})
			.expect(200);

		expect(validateResponse.body).toEqual(
			expect.objectContaining({ message: 'Verification completed' }),
		);
	});

	it('/auth/otp/validate (POST) rejects already-verified OTP', async () => {
		const email = uniqueEmail();
		const code = '123456';
		await requestEmailOtpAndSeedKnownCode(email, code);

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: code,
			})
			.expect(200);

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: code,
			})
			.expect(400);
	});

	it('/auth/otp/resend (POST) rotates OTP code', async () => {
		const email = uniqueEmail();
		const firstCode = '123456';
		const secondCode = '654321';
		await requestEmailOtpAndSeedKnownCode(email, firstCode);

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/resend')
			.send({
				type: 'ACCOUNT_VERIFICATION',
				identifier: 'EMAIL',
				value: email,
			})
			.expect(201);

		const latestOtpAfterResend = await prisma.oTP.findFirst({
			where: { value: email, type: 'ACCOUNT_VERIFICATION' },
			orderBy: { createdAt: 'desc' },
		});
		expect(latestOtpAfterResend).toBeTruthy();
		await prisma.oTP.update({
			where: { id: latestOtpAfterResend!.id },
			data: { otpCode: await hash(secondCode, 10) },
		});

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: firstCode,
			})
			.expect(400);

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: secondCode,
			})
			.expect(200);
	});

	it('/auth/otp/validate (POST) rejects expired OTP', async () => {
		const email = uniqueEmail();
		const code = '123456';
		await requestEmailOtpAndSeedKnownCode(email, code);

		const latestOtp = await prisma.oTP.findFirst({
			where: { value: email, type: 'ACCOUNT_VERIFICATION' },
			orderBy: { createdAt: 'desc' },
		});
		expect(latestOtp).toBeTruthy();

		await prisma.oTP.update({
			where: { id: latestOtp!.id },
			data: { expiresAt: new Date(Date.now() - 5_000) },
		});

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: code,
			})
			.expect(400);
	});

	it('/auth/otp/validate (POST) rejects when attempts exhausted', async () => {
		const email = uniqueEmail();
		const code = '123456';
		await requestEmailOtpAndSeedKnownCode(email, code);

		const latestOtp = await prisma.oTP.findFirst({
			where: { value: email, type: 'ACCOUNT_VERIFICATION' },
			orderBy: { createdAt: 'desc' },
		});
		expect(latestOtp).toBeTruthy();

		await prisma.oTP.update({
			where: { id: latestOtp!.id },
			data: { attempts: 0 },
		});

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/validate')
			.send({
				value: email,
				type: 'ACCOUNT_VERIFICATION',
				otpCode: code,
			})
			.expect(400);
	});

	it('/auth/otp/request (POST) enforces request limit per value', async () => {
		const email = uniqueEmail();

		for (let i = 0; i < 5; i++) {
			await request(app.getHttpServer())
				.post('/api/v1/auth/otp/request')
				.send({
					type: 'ACCOUNT_VERIFICATION',
					identifier: 'EMAIL',
					value: email,
				})
				.expect(201);
		}

		await request(app.getHttpServer())
			.post('/api/v1/auth/otp/request')
			.send({
				type: 'ACCOUNT_VERIFICATION',
				identifier: 'EMAIL',
				value: email,
			})
			.expect(400);
	});
});
