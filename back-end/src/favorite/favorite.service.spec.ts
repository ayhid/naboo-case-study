import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { closeInMongodConnection, TestModule } from 'src/test/test.module';
import { FavoriteModule } from './favorite.module';
import { FavoriteService } from './favorite.service';

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, FavoriteModule],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('adds favorites without duplicates and keeps insertion order', async () => {
    const userId = new Types.ObjectId().toString();
    const activityOne = new Types.ObjectId().toString();
    const activityTwo = new Types.ObjectId().toString();

    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityTwo });

    const ids = await service.getFavoriteActivityIds(userId);
    expect(ids).toEqual([activityOne, activityTwo]);
  });

  it('reindexes positions after deletion', async () => {
    const userId = new Types.ObjectId().toString();
    const activityOne = new Types.ObjectId().toString();
    const activityTwo = new Types.ObjectId().toString();
    const activityThree = new Types.ObjectId().toString();

    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityTwo });
    await service.addFavoriteActivity({ userId, activityId: activityThree });

    await service.removeFavoriteActivity({ userId, activityId: activityTwo });

    const ids = await service.getFavoriteActivityIds(userId);
    expect(ids).toEqual([activityOne, activityThree]);
  });

  it('validates reorder payload against duplicates and current state', async () => {
    const userId = new Types.ObjectId().toString();
    const activityOne = new Types.ObjectId().toString();
    const activityTwo = new Types.ObjectId().toString();

    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityTwo });

    await expect(
      service.reorderFavoriteActivities({
        userId,
        activityIds: [activityTwo, activityTwo],
      }),
    ).rejects.toThrow('Favorites cannot contain duplicates');

    await expect(
      service.reorderFavoriteActivities({
        userId,
        activityIds: [activityTwo],
      }),
    ).rejects.toThrow('Favorites reorder list must include all favorites');
  });

  it('reorders favorites with a stable persisted order', async () => {
    const userId = new Types.ObjectId().toString();
    const activityOne = new Types.ObjectId().toString();
    const activityTwo = new Types.ObjectId().toString();
    const activityThree = new Types.ObjectId().toString();

    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityTwo });
    await service.addFavoriteActivity({ userId, activityId: activityThree });

    await service.reorderFavoriteActivities({
      userId,
      activityIds: [activityThree, activityOne, activityTwo],
    });

    const reorderedIds = await service.getFavoriteActivityIds(userId);
    expect(reorderedIds).toEqual([activityThree, activityOne, activityTwo]);
  });

  it('keeps reordered favorites order after subsequent reads (refresh simulation)', async () => {
    const userId = new Types.ObjectId().toString();
    const activityOne = new Types.ObjectId().toString();
    const activityTwo = new Types.ObjectId().toString();
    const activityThree = new Types.ObjectId().toString();

    await service.addFavoriteActivity({ userId, activityId: activityOne });
    await service.addFavoriteActivity({ userId, activityId: activityTwo });
    await service.addFavoriteActivity({ userId, activityId: activityThree });

    await service.reorderFavoriteActivities({
      userId,
      activityIds: [activityTwo, activityThree, activityOne],
    });

    const firstRead = await service.getFavoriteActivityIds(userId);
    const secondRead = await service.getFavoriteActivityIds(userId);

    expect(firstRead).toEqual([activityTwo, activityThree, activityOne]);
    expect(secondRead).toEqual([activityTwo, activityThree, activityOne]);
  });
});
