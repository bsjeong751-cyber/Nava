import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Place, Trip } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlacesService } from '../places/places.service';
import { RecommendationService } from '../recommendation/recommendation.service';
import { PlaceCandidate } from '../places/place-provider.interface';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateRoutePlacesDto } from './dto/update-route-places.dto';

function placeToCandidate(place: Place): PlaceCandidate {
  return {
    externalId: place.id,
    name: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    openingHours: place.openingHours ?? undefined,
    rating: place.rating ?? undefined,
    reviewCount: place.reviewCount ?? undefined,
    priceLevel: place.priceLevel ?? undefined,
    estimatedStayMinutes: place.estimatedStayMinutes,
    tags: place.tags,
    description: place.description ?? undefined,
    imageUrl: place.imageUrl ?? undefined,
  };
}

function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placesService: PlacesService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async createTrip(userId: string, dto: CreateTripDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('종료일이 시작일보다 빠를 수 없어요.');
    }

    const tripDays = diffInDays(startDate, endDate);

    return this.prisma.trip.create({
      data: {
        userId,
        title: dto.title ?? `${dto.destination} 여행`,
        destination: dto.destination,
        startDate,
        endDate,
        interests: dto.interests,
        mustVisit: dto.mustVisit ?? [],
        budget: dto.budget,
        budgetAmount: dto.budgetAmount,
        pace: dto.pace,
        mobility: dto.mobility,
        days: {
          create: Array.from({ length: tripDays }, (_, i) => ({
            dayNumber: i + 1,
            date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
          })),
        },
      },
      include: { days: true },
    });
  }

  async listTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrip(userId: string, tripId: string) {
    await this.assertOwnership(userId, tripId);
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        routes: {
          include: {
            places: {
              include: { place: true },
              orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            },
          },
        },
        selectedRoute: true,
      },
    });
  }

  async generateRoutes(userId: string, tripId: string) {
    const trip = await this.assertOwnership(userId, tripId);
    const tripDays = diffInDays(trip.startDate, trip.endDate);

    const pool = await this.placesService.search(trip.destination);
    const mustVisitMatches = (
      await Promise.all(trip.mustVisit.map((name) => this.placesService.matchByName(trip.destination, name)))
    ).flat();

    const candidateMap = new Map<string, PlaceCandidate>();
    [...pool, ...mustVisitMatches].forEach((c) => candidateMap.set(c.externalId, c));
    const candidates = [...candidateMap.values()];

    const drafts = this.recommendationService.generateRoutes({
      destination: trip.destination,
      tripDays,
      interests: trip.interests,
      mustVisit: trip.mustVisit,
      budget: trip.budget,
      budgetAmount: trip.budgetAmount,
      pace: trip.pace,
      mobility: trip.mobility,
      candidates,
    });

    // upsert 후보 장소들을 Place 테이블에 저장 (참조 무결성 보장)
    await Promise.all(candidates.map((c) => this.placesService.upsertCandidate(c)));

    // 재생성 시 기존 루트는 교체한다.
    await this.prisma.trip.update({ where: { id: tripId }, data: { selectedRouteId: null } });
    await this.prisma.route.deleteMany({ where: { tripId } });

    for (const draft of drafts) {
      await this.prisma.route.create({
        data: {
          tripId,
          type: draft.type,
          name: draft.name,
          estimatedBudgetMin: draft.estimatedBudgetMin,
          estimatedBudgetMax: draft.estimatedBudgetMax,
          totalDurationMinutes: draft.totalDurationMinutes,
          totalDistanceMeters: draft.totalDistanceMeters,
          reasoningSummary: draft.reasoningSummary,
          places: {
            create: draft.places.map((p) => ({
              placeId: p.place.externalId,
              dayNumber: p.dayNumber,
              orderIndex: p.orderIndex,
              arrivalTime: p.arrivalTime,
              stayMinutes: p.stayMinutes,
              mobilityToHere: p.mobilityToHere as never,
              travelMinutes: p.travelMinutes,
              slotType: p.slotType,
              note: p.note,
            })),
          },
        },
      });
    }

    return this.getTrip(userId, tripId);
  }

  async selectRoute(userId: string, tripId: string, routeId: string) {
    await this.assertOwnership(userId, tripId);
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route || route.tripId !== tripId) {
      throw new NotFoundException('해당 루트를 찾을 수 없어요.');
    }

    await this.prisma.trip.update({ where: { id: tripId }, data: { selectedRouteId: routeId } });
    return this.getTrip(userId, tripId);
  }

  async updateRoutePlaces(userId: string, tripId: string, routeId: string, dto: UpdateRoutePlacesDto) {
    const trip = await this.assertOwnership(userId, tripId);
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route || route.tripId !== tripId) {
      throw new NotFoundException('해당 루트를 찾을 수 없어요.');
    }

    const placeIds = dto.places.filter((p) => p.placeId).map((p) => p.placeId as string);
    const places = await this.prisma.place.findMany({ where: { id: { in: placeIds } } });
    const placeById = new Map(places.map((p) => [p.id, p]));

    const tripDays = diffInDays(trip.startDate, trip.endDate);
    const daysOfPlaces: PlaceCandidate[][] = Array.from({ length: tripDays }, () => []);

    for (const item of dto.places) {
      if (!item.placeId) continue;
      const place = placeById.get(item.placeId);
      if (!place) continue;
      const dayIndex = Math.min(Math.max(item.dayNumber - 1, 0), tripDays - 1);
      const candidate = placeToCandidate(place);
      if (item.stayMinutes) candidate.estimatedStayMinutes = item.stayMinutes;
      daysOfPlaces[dayIndex].push(candidate);
    }

    const recalculated = this.recommendationService.recalculateSchedule(
      daysOfPlaces,
      trip.mobility,
      trip.budget,
      trip.budgetAmount,
    );

    await this.prisma.routePlace.deleteMany({ where: { routeId } });
    await this.prisma.route.update({
      where: { id: routeId },
      data: {
        totalDurationMinutes: recalculated.totalDurationMinutes,
        totalDistanceMeters: recalculated.totalDistanceMeters,
        estimatedBudgetMin: recalculated.estimatedBudgetMin,
        estimatedBudgetMax: recalculated.estimatedBudgetMax,
        places: {
          create: recalculated.places.map((p) => ({
            placeId: p.place.externalId,
            dayNumber: p.dayNumber,
            orderIndex: p.orderIndex,
            arrivalTime: p.arrivalTime,
            stayMinutes: p.stayMinutes,
            mobilityToHere: p.mobilityToHere as never,
            travelMinutes: p.travelMinutes,
            slotType: p.slotType,
            note: p.note,
          })),
        },
      },
    });

    return this.getTrip(userId, tripId);
  }

  private async assertOwnership(userId: string, tripId: string): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException('여행을 찾을 수 없어요.');
    }
    if (trip.userId !== userId) {
      throw new ForbiddenException('본인의 여행만 수정할 수 있어요.');
    }
    return trip;
  }
}
