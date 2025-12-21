import { Test, TestingModule } from "@nestjs/testing";
import { UserTwoStepVerificationController } from "./user-two-step-verification.controller";

describe("UserTwoStepVerificationController", () => {
  let controller: UserTwoStepVerificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTwoStepVerificationController],
    }).compile();

    controller = module.get<UserTwoStepVerificationController>(UserTwoStepVerificationController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
