import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('OtpController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.setGlobalPrefix('/api/v1');
		await app.init();
	});

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
});
