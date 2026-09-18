import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { PlacesModule } from '../places/places.module';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [PlacesModule, RecommendationModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
