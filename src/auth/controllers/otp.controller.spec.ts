import { Test, TestingModule } from '@nestjs/testing';
import { OTPController } from './otp.controller';

describe('OTPController', () => {
	let controller: OTPController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [OTPController],
		}).compile();

		controller = module.get<OTPController>(OTPController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
