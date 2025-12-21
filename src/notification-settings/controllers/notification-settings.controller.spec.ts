import { Test, TestingModule } from "@nestjs/testing";
import { NotificationSettingsController } from "./notification-settings.controller";

describe("NotificationSettingsController", () => {
  let controller: NotificationSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSettingsController],
    }).compile();

    controller = module.get<NotificationSettingsController>(NotificationSettingsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
