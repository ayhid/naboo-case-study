import { PayloadDto } from './jwtPayload.dto';
import { User } from 'src/user/user.schema';

export interface ContextWithJWTPayload {
  jwtPayload: PayloadDto | null;
  currentUserRole?: User['role'];
}
