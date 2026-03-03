import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { FavoriteService } from './favorite.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}

