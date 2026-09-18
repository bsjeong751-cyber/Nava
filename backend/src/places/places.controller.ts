import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlacesService } from './places.service';

@Controller('places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('search')
  search(@Query('destination') destination: string, @Query('q') query?: string) {
    return this.placesService.search(destination, query);
  }
}
