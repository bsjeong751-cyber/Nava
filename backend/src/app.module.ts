import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlacesModule } from './places/places.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { TripsModule } from './trips/trips.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlacesModule,
    RecommendationModule,
    TripsModule,
    CommunityModule,
  ],
})
export class AppModule {}
