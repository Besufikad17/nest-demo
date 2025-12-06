import { Test, TestingModule } from '@nestjs/testing';
import { UserSsoController } from './user-sso.controller';

describe('UserSsoController', () => {
  let controller: UserSsoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSsoController],
    }).compile();

    controller = module.get<UserSsoController>(UserSsoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
