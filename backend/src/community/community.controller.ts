import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ReportPostDto } from './dto/report-post.dto';

@Controller('community/posts')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(user.userId, dto);
  }

  @Get()
  list() {
    return this.communityService.listPosts();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.communityService.getPost(id);
  }

  @Post(':id/import')
  import(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.communityService.importPost(user.userId, id);
  }

  @Post(':id/report')
  report(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: ReportPostDto) {
    return this.communityService.reportPost(user.userId, id, dto);
  }
}
