import { Test, TestingModule } from "@nestjs/testing";
import { UserSsoService } from "./user-sso.service";

describe("UserSsoService", () => {
  let service: UserSsoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSsoService],
    }).compile();

    service = module.get<UserSsoService>(UserSsoService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
