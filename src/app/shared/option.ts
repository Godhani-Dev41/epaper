import {Identifiable} from './identifiable';

export interface Option extends Identifiable{
  description: string,
  order?: number
}
