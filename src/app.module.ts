import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionsFilter } from '@common/filters';
import { TransformInterceptor } from '@common/interceptors';
import { CronJobsModule } from '@jobs/cron-jobs.module';
import { appConfig, cacheConfig, databaseConfig, googleApiConfig, jwtConfig } from './config';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ProxyRewriteImageMiddleware } from '@common/middlewares/proxy-rewrite-image.middleware';
import { AppController } from './app.controller';
import { MapModule } from '@modules/map/map.module';
import { SlackNotificationService } from '@infrastructure/services/slack/slack-notification.service';
import { SlackService } from 'nestjs-slack';
import { SlackNotificationModule } from '@infrastructure/services/slack/slack-notification.module';
import { slackConfig } from './config/slack.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [databaseConfig, jwtConfig, googleApiConfig, cacheConfig, appConfig, slackConfig],
            isGlobal: true,
        }),
        InfrastructureModule,
        CronJobsModule,
        UserModule,
        MapModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: 'APP_FILTER',
            useClass: AllExceptionsFilter,
        },
        {
            provide: 'APP_INTERCEPTOR',
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        MorganMiddleware.configure(
            ':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] ":user-agent" - :response-time ms - :status',
        );
        consumer.apply(MorganMiddleware).forRoutes('*');
        consumer
            .apply(ProxyRewriteImageMiddleware)
            .forRoutes({ path: 'images/:id', method: RequestMethod.GET });
    }
}
