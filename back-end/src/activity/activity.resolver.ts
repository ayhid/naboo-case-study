import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  Parent,
  ResolveField,
  ID,
} from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Activity } from './activity.schema';

import { CreateActivityInput } from './activity.inputs.dto';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { FavoriteService } from 'src/favorite/favorite.service';
import { UserService } from 'src/user/user.service';
import { USER_ROLES } from 'src/user/user.constants';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly favoriteService: FavoriteService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => ID)
  id(@Parent() activity: Activity): string {
    return activity._id.toString();
  }

  @ResolveField(() => User)
  async owner(@Parent() activity: Activity): Promise<User> {
    await activity.populate('owner');
    return activity.owner;
  }

  @ResolveField(() => Date, { nullable: true })
  async createdAt(
    @Parent() activity: Activity,
    @Context() context: ContextWithJWTPayload,
  ): Promise<Date | null> {
    if (!context.jwtPayload?.id) return null;

    if (!context.currentUserRole) {
      try {
        const user = await this.userService.getById(context.jwtPayload.id);
        context.currentUserRole = user.role;
      } catch {
        return null;
      }
    }

    if (context.currentUserRole !== USER_ROLES.ADMIN) return null;
    return activity.createdAt ?? null;
  }

  @Query(() => [Activity])
  async getActivities(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Query(() => [Activity])
  async getLatestActivities(): Promise<Activity[]> {
    return this.activityService.findLatest();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getActivitiesByUser(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    return this.activityService.findByUser(context.jwtPayload!.id);
  }

  @Query(() => [String])
  async getCities(): Promise<string[]> {
    const cities = await this.activityService.findCities();
    return cities;
  }

  @Query(() => [Activity])
  async getActivitiesByCity(
    @Args('city') city: string,
    @Args({ name: 'activity', nullable: true }) activity?: string,
    @Args({ name: 'price', nullable: true, type: () => Int }) price?: number,
  ): Promise<Activity[]> {
    return this.activityService.findByCity(city, activity, price);
  }

  @Query(() => Activity)
  async getActivity(@Args('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getFavoriteActivities(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    const favoriteActivityIds = await this.favoriteService.getFavoriteActivityIds(
      context.jwtPayload!.id,
    );

    return this.activityService.findByIds(favoriteActivityIds);
  }

  @Mutation(() => Activity)
  @UseGuards(AuthGuard)
  async createActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('createActivityInput') createActivity: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(context.jwtPayload!.id, createActivity);
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async addFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<Activity[]> {
    await this.activityService.findOne(activityId);
    await this.favoriteService.addFavoriteActivity({
      userId: context.jwtPayload!.id,
      activityId,
    });

    const favoriteActivityIds = await this.favoriteService.getFavoriteActivityIds(
      context.jwtPayload!.id,
    );
    return this.activityService.findByIds(favoriteActivityIds);
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async removeFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<Activity[]> {
    await this.favoriteService.removeFavoriteActivity({
      userId: context.jwtPayload!.id,
      activityId,
    });

    const favoriteActivityIds = await this.favoriteService.getFavoriteActivityIds(
      context.jwtPayload!.id,
    );
    return this.activityService.findByIds(favoriteActivityIds);
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async reorderFavoriteActivities(
    @Context() context: ContextWithJWTPayload,
    @Args({ name: 'activityIds', type: () => [String] })
    activityIds: string[],
  ): Promise<Activity[]> {
    if (activityIds.length > 0) {
      const activities = await this.activityService.findByIds(activityIds);
      if (activities.length !== activityIds.length) {
        throw new BadRequestException('Some activities were not found');
      }
    }

    await this.favoriteService.reorderFavoriteActivities({
      userId: context.jwtPayload!.id,
      activityIds,
    });

    return this.activityService.findByIds(activityIds);
  }
}
