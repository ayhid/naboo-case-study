import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Favorite } from './favorite.schema';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<Favorite>,
  ) {}

  async getFavoriteActivityIds(userId: string): Promise<string[]> {
    const favorites = await this.favoriteModel
      .find({ userId })
      .sort({ position: 1 })
      .select('activityId')
      .exec();

    return favorites.map((favorite) => favorite.activityId.toString());
  }

  async addFavoriteActivity({
    userId,
    activityId,
  }: {
    userId: string;
    activityId: string;
  }): Promise<void> {
    const existingFavorite = await this.favoriteModel
      .findOne({ userId, activityId })
      .exec();

    if (existingFavorite) {
      return;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latestFavorite = await this.favoriteModel
        .findOne({ userId })
        .sort({ position: -1 })
        .select('position')
        .exec();

      const nextPosition = (latestFavorite?.position ?? 0) + 1;

      try {
        await this.favoriteModel.create({
          userId,
          activityId,
          position: nextPosition,
        });
        return;
      } catch (error) {
        if (!this.isDuplicateKeyError(error)) {
          throw error;
        }

        const concurrentlyCreatedFavorite = await this.favoriteModel
          .findOne({ userId, activityId })
          .exec();
        if (concurrentlyCreatedFavorite) {
          return;
        }
      }
    }

    throw new BadRequestException(
      'Unable to add favorite right now, please retry',
    );
  }

  async removeFavoriteActivity({
    userId,
    activityId,
  }: {
    userId: string;
    activityId: string;
  }): Promise<void> {
    const existingFavorite = await this.favoriteModel
      .findOne({ userId, activityId })
      .select('position')
      .exec();

    if (!existingFavorite) {
      return;
    }

    await this.favoriteModel.deleteOne({ userId, activityId }).exec();

    await this.favoriteModel
      .updateMany(
        { userId, position: { $gt: existingFavorite.position } },
        { $inc: { position: -1 } },
      )
      .exec();
  }

  async reorderFavoriteActivities({
    userId,
    activityIds,
  }: {
    userId: string;
    activityIds: string[];
  }): Promise<void> {
    const uniqueActivityIds = [...new Set(activityIds)];
    if (uniqueActivityIds.length !== activityIds.length) {
      throw new BadRequestException('Favorites cannot contain duplicates');
    }

    const currentFavorites = await this.favoriteModel
      .find({ userId })
      .sort({ position: 1 })
      .select('activityId')
      .exec();

    const currentActivityIds = currentFavorites.map((favorite) =>
      favorite.activityId.toString(),
    );

    if (activityIds.length !== currentActivityIds.length) {
      throw new BadRequestException('Favorites reorder list must include all favorites');
    }

    const hasSameItems = currentActivityIds.every((id) => activityIds.includes(id));
    if (!hasSameItems) {
      throw new BadRequestException('Favorites reorder list does not match current favorites');
    }

    if (activityIds.length === 0) {
      return;
    }

    // Two-phase update avoids temporary unique index collisions when positions swap.
    const positionOffset = activityIds.length + 1;
    await this.favoriteModel.bulkWrite(
      activityIds.map((activityId, index) => ({
        updateOne: {
          filter: { userId, activityId } as FilterQuery<Favorite>,
          update: { $set: { position: index + 1 + positionOffset } },
        },
      })),
    );

    await this.favoriteModel.bulkWrite(
      activityIds.map((activityId, index) => ({
        updateOne: {
          filter: { userId, activityId } as FilterQuery<Favorite>,
          update: { $set: { position: index + 1 } },
        },
      })),
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const candidate = error as { code?: number };
    return candidate.code === 11000;
  }
}
