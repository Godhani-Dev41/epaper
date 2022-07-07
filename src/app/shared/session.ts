import {Identifiable} from './identifiable';
import {Pointer} from './pointer';

export interface Session extends Identifiable {
  expiresAt: Date,
  user: Pointer,
  createdWith: any,
  installationId: string,
  restricted: boolean
}
