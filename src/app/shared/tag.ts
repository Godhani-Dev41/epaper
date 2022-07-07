import {Identifiable} from './identifiable';

export interface Tag extends Identifiable{
  identifier?: string,
  title: string,
  description: string
}
