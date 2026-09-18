import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { PLACE_PROVIDER } from './place-provider.interface';
import { MockPlaceProvider } from './mock-place-provider';

@Module({
  controllers: [PlacesController],
  providers: [
    PlacesService,
    { provide: PLACE_PROVIDER, useClass: MockPlaceProvider },
  ],
  exports: [PlacesService],
})
export class PlacesModule {}
