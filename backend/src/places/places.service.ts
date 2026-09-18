import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLACE_PROVIDER, PlaceCandidate, PlaceProvider } from './place-provider.interface';

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PLACE_PROVIDER) private readonly placeProvider: PlaceProvider,
  ) {}

  async search(destination: string, query?: string) {
    return this.placeProvider.search(destination, query);
  }

  async matchByName(destination: string, name: string) {
    return this.placeProvider.matchByName(destination, name);
  }

  /** 후보 장소를 실제 Place 레코드로 upsert 한다 (externalId 기준). */
  async upsertCandidate(candidate: PlaceCandidate) {
    return this.prisma.place.upsert({
      where: { id: candidate.externalId },
      update: {
        name: candidate.name,
        category: candidate.category,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address: candidate.address,
        openingHours: candidate.openingHours,
        rating: candidate.rating,
        reviewCount: candidate.reviewCount,
        priceLevel: candidate.priceLevel,
        estimatedStayMinutes: candidate.estimatedStayMinutes,
        tags: candidate.tags,
        description: candidate.description,
        imageUrl: candidate.imageUrl,
        source: 'MOCK',
        lastVerifiedAt: new Date(),
      },
      create: {
        id: candidate.externalId,
        name: candidate.name,
        category: candidate.category,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address: candidate.address,
        openingHours: candidate.openingHours,
        rating: candidate.rating,
        reviewCount: candidate.reviewCount,
        priceLevel: candidate.priceLevel,
        estimatedStayMinutes: candidate.estimatedStayMinutes,
        tags: candidate.tags,
        description: candidate.description,
        imageUrl: candidate.imageUrl,
        source: 'MOCK',
        lastVerifiedAt: new Date(),
      },
    });
  }
}
