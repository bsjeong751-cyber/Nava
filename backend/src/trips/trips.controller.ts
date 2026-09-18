import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateRoutePlacesDto } from './dto/update-route-places.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTripDto) {
    return this.tripsService.createTrip(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.tripsService.listTrips(user.userId);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tripsService.getTrip(user.userId, id);
  }

  @Post(':id/routes/generate')
  generateRoutes(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tripsService.generateRoutes(user.userId, id);
  }

  @Post(':id/select-route')
  selectRoute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('routeId') routeId: string,
  ) {
    return this.tripsService.selectRoute(user.userId, id, routeId);
  }

  @Patch(':id/routes/:routeId/places')
  updateRoutePlaces(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('routeId') routeId: string,
    @Body() dto: UpdateRoutePlacesDto,
  ) {
    return this.tripsService.updateRoutePlaces(user.userId, id, routeId, dto);
  }
}
