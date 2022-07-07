import {Identifiable} from './identifiable';
import {Pointer} from './pointer';

export interface Media extends Identifiable{
  company?: Pointer,
  createdBy: Pointer,
  title: string,
  description: string,
  isLive: boolean
}
