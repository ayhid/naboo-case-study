import { ActivityResolver } from './activity.resolver';
import { Activity } from './activity.schema';
import { USER_ROLES } from 'src/user/user.constants';

describe('ActivityResolver', () => {
  const activityService = {} as any;
  const favoriteService = {} as any;
  const userService = {
    getById: jest.fn(),
  };

  let resolver: ActivityResolver;

  beforeEach(() => {
    userService.getById.mockReset();
    resolver = new ActivityResolver(
      activityService,
      favoriteService,
      userService as any,
    );
  });

  it('returns createdAt for admin users', async () => {
    const createdAt = new Date('2026-03-01T10:00:00.000Z');
    const activity = { createdAt } as Activity;
    const context = {
      jwtPayload: { id: 'user-id' },
    } as any;

    userService.getById.mockResolvedValue({ role: USER_ROLES.ADMIN });

    const value = await resolver.createdAt(activity, context);

    expect(value).toEqual(createdAt);
    expect(context.currentUserRole).toBe(USER_ROLES.ADMIN);
  });

  it('returns null for non-admin users', async () => {
    const activity = { createdAt: new Date('2026-03-01T10:00:00.000Z') } as Activity;
    const context = {
      jwtPayload: { id: 'user-id' },
    } as any;

    userService.getById.mockResolvedValue({ role: USER_ROLES.USER });

    const value = await resolver.createdAt(activity, context);

    expect(value).toBeNull();
  });

  it('returns null for unauthenticated requests', async () => {
    const activity = { createdAt: new Date('2026-03-01T10:00:00.000Z') } as Activity;

    const value = await resolver.createdAt(activity, {} as any);

    expect(value).toBeNull();
    expect(userService.getById).not.toHaveBeenCalled();
  });
});
