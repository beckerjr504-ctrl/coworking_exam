import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me')
  findMine(@Req() req: any) {
    return this.favoritesService.findMine(req.user.userId);
  }

  @Post(':spaceId')
  add(@Req() req: any, @Param('spaceId', ParseIntPipe) spaceId: number) {
    return this.favoritesService.add(req.user.userId, spaceId);
  }

  @Delete(':spaceId')
  remove(@Req() req: any, @Param('spaceId', ParseIntPipe) spaceId: number) {
    return this.favoritesService.remove(req.user.userId, spaceId);
  }
}