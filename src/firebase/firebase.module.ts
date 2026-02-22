import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseProvider } from './providers/firebase.provider';
import { FirebaseService } from './services/firebase.service';
import * as Interface from './interfaces';

@Module({
  imports: [ConfigModule],
  providers: [
    { provide: Interface.IFirebaseService, useClass: FirebaseService },
    FirebaseProvider,
  ],
  exports: [Interface.IFirebaseService]
})
export class FirebaseModule { }
