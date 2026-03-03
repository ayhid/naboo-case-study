import { User } from 'src/user/user.schema';
import { USER_ROLES } from 'src/user/user.constants';

export const user = {
  email: 'user1@test.fr',
  password: 'user1',
  firstName: 'John',
  lastName: 'Doe',
};

export const admin = {
  email: 'admin@test.fr',
  password: 'admin',
  firstName: 'Admin',
  lastName: 'Boss',
  role: USER_ROLES.ADMIN as User['role'],
};
