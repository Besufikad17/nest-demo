import { Test, TestingModule } from "@nestjs/testing";
import { UserTwoStepVerificationService } from "./user-two-step-verification.service";

describe("UserTwoStepVerificationService", () => {
  let service: UserTwoStepVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserTwoStepVerificationService],
    }).compile();

    service = module.get<UserTwoStepVerificationService>(UserTwoStepVerificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
