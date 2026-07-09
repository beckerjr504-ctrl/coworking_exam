import { Controller, Get, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  findMine(@Req() req: any) {
    return this.notificationsService.findMine(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }
}