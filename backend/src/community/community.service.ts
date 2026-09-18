import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ReportPostDto } from './dto/report-post.dto';

// 신고가 이 수를 넘으면 자동으로 게시물을 숨기고 관리자 검토 대상으로 표시한다
// (기획서 27항: HIGH 등급 = 게시물 숨김 + 관리자 검토. MVP에서는 단순 카운트 기준 사용).
const AUTO_HIDE_REPORT_THRESHOLD = 5;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId } });
    if (!trip) {
      throw new NotFoundException('공유할 여행을 찾을 수 없어요.');
    }
    if (trip.userId !== userId) {
      throw new ForbiddenException('본인의 여행만 공유할 수 있어요.');
    }
    if (!trip.selectedRouteId) {
      throw new BadRequestException('먼저 루트를 하나 선택한 뒤 공유할 수 있어요.');
    }

    await this.prisma.trip.update({ where: { id: trip.id }, data: { visibility: 'PUBLIC' } });

    return this.prisma.communityPost.create({
      data: {
        authorId: userId,
        tripId: trip.id,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async listPosts() {
    return this.prisma.communityPost.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, nickname: true } },
        trip: { select: { destination: true, startDate: true, endDate: true, budget: true } },
      },
    });
  }

  async getPost(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, nickname: true } },
        trip: {
          include: {
            days: { orderBy: { dayNumber: 'asc' } },
            routes: {
              include: { places: { include: { place: true }, orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }] } },
            },
          },
        },
        comments: { include: { author: { select: { id: true, nickname: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!post || post.isHidden) {
      throw new NotFoundException('게시물을 찾을 수 없어요.');
    }

    await this.prisma.communityPost.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } });
    return post;
  }

  /** 원본을 변경하지 않고 복사본을 만들어 사용자가 자유롭게 수정할 수 있게 한다 (기획서 26항). */
  async importPost(userId: string, postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        trip: {
          include: {
            routes: { include: { places: true } },
          },
        },
      },
    });
    if (!post || post.isHidden) {
      throw new NotFoundException('게시물을 찾을 수 없어요.');
    }

    const sourceTrip = post.trip;
    const newTrip = await this.prisma.trip.create({
      data: {
        userId,
        title: `내 ${sourceTrip.title}`,
        destination: sourceTrip.destination,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        interests: sourceTrip.interests,
        mustVisit: sourceTrip.mustVisit,
        budget: sourceTrip.budget,
        budgetAmount: sourceTrip.budgetAmount,
        pace: sourceTrip.pace,
        mobility: sourceTrip.mobility,
        forkedFromPostId: post.id,
        days: {
          create: Array.from({ length: this.diffInDays(sourceTrip.startDate, sourceTrip.endDate) }, (_, i) => ({
            dayNumber: i + 1,
            date: new Date(sourceTrip.startDate.getTime() + i * 24 * 60 * 60 * 1000),
          })),
        },
      },
    });

    for (const route of sourceTrip.routes) {
      const newRoute = await this.prisma.route.create({
        data: {
          tripId: newTrip.id,
          type: route.type,
          name: route.name,
          estimatedBudgetMin: route.estimatedBudgetMin,
          estimatedBudgetMax: route.estimatedBudgetMax,
          totalDurationMinutes: route.totalDurationMinutes,
          totalDistanceMeters: route.totalDistanceMeters,
          reasoningSummary: route.reasoningSummary,
          places: {
            create: route.places.map((p) => ({
              placeId: p.placeId,
              dayNumber: p.dayNumber,
              orderIndex: p.orderIndex,
              arrivalTime: p.arrivalTime,
              stayMinutes: p.stayMinutes,
              mobilityToHere: p.mobilityToHere,
              travelMinutes: p.travelMinutes,
              slotType: p.slotType,
              note: p.note,
            })),
          },
        },
      });
      if (route.id === sourceTrip.selectedRouteId) {
        await this.prisma.trip.update({ where: { id: newTrip.id }, data: { selectedRouteId: newRoute.id } });
      }
    }

    await this.prisma.communityPost.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } });

    return this.prisma.trip.findUnique({ where: { id: newTrip.id }, include: { days: true, routes: { include: { places: true } } } });
  }

  async reportPost(userId: string, postId: string, dto: ReportPostDto) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없어요.');
    }

    await this.prisma.communityReport.create({
      data: { postId, reporterId: userId, reason: dto.reason, detail: dto.detail },
    });

    const reportCount = await this.prisma.communityReport.count({ where: { postId } });
    if (reportCount >= AUTO_HIDE_REPORT_THRESHOLD) {
      await this.prisma.communityPost.update({ where: { id: postId }, data: { isHidden: true } });
    }

    return { reported: true };
  }

  private diffInDays(start: Date, end: Date): number {
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
  }
}
