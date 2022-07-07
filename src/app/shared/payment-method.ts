import {Identifiable} from './identifiable';
import {Pointer} from './pointer';

export interface PaymentMethod extends Identifiable {
  title?: string,
  description?: string,
  isDefault?: boolean,
  isActive?: boolean,
  isDebit?: boolean,
  cardInfo?: string,
  customerId?: string,
  owner: Pointer,
  type: string,
  metaData?: any
}
