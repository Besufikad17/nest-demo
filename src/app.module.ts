import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AppService } from './app.service';
import { TreeModule } from './employee/employee.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TreeModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('api/employee');
  }
}
