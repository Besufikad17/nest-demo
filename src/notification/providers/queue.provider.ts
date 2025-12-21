import { ConfigService } from "@nestjs/config";
import { Queue, Worker } from "bullmq";
import * as admin from "firebase-admin";
import { IFcmTokenRepository } from "../interfaces";

export const QueueProvider = {
  provide: "QUEUE",
  inject: [ConfigService, IFcmTokenRepository],
  useFactory: (configService: ConfigService, fcmTokenRepository: IFcmTokenRepository) => {
    const firebaseConfig = {
      type: configService.get<string>("TYPE"),
      project_id: configService.get<string>("FIREBASE_PROJECT_ID"),
      private_key_id: configService.get<string>("FIREBASE_PRIVATE_KEY_ID"),
      private_key: configService.get<string>("FIREBASE_PRIVATE_KEY"),
      client_email: configService.get<string>("FIREBASE_CLIENT_EMAIL"),
      client_id: configService.get<string>("FIREBASE_CLIENT_ID"),
      auth_uri: configService.get<string>("FIREBASE_AUTH_URI"),
      token_uri: configService.get<string>("FIREBASE_TOKEN_URI"),
      auth_provider_x509_cert_url: configService.get<string>("FIREBASE_AUTH_CERT_URL"),
      client_x509_cert_url: configService.get<string>("FIREBASE_CLIENT_CERT_URL"),
      universe_domain: configService.get<string>("FIREBASE_UNIVERSAL_DOMAIN"),
    } as admin.ServiceAccount;

    const firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });

    const redisConnection = {
      port: configService.get<number>("REDIS_PORT"),
      host: configService.get<string>("REDIS_HOST"),
      password: configService.get<string>("REDIS_PASSWORD"),
      maxRetriesPerRequest: 3
    };

    const pushNotificationQueue = new Queue("pushNotificationQueue", {
      connection: redisConnection,
    });

    const worker = new Worker(
      "pushNotificationQueue",
      async (job) => {
        const { notificationsBatch } = job.data;

        try {
          console.log("the data", notificationsBatch);
          const resp = await firebaseAdmin.messaging().send({
            token: notificationsBatch.fcmToken,
            notification: {
              title: notificationsBatch.title,
              body: notificationsBatch.body,
            },
          });
          console.log("THE RESPONSE_____------______", resp);
        } catch (error: any) {
          console.error(error);
          if (
            error.errorInfo.code ===
            "messaging/registration-token-not-registered" &&
            error.errorInfo.message === "Requested entity was not found."
          ) {
            try {
              await fcmTokenRepository.deleteFcmToken({
                where: {
                  id: notificationsBatch.fcmTokenId
                }
              });
            } catch (error: any) {
              if (
                error.code === "P2025" &&
                error.meta.cause === "Record to delete does not exist."
              ) {
                console.log("Device not registered");
              }
            }
          }
        }
      },
      { connection: redisConnection }
    );

    return { pushNotificationQueue, worker };
  }
}
