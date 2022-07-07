import {Address} from './address';

export interface StripeCard {
  number?: string,
  type: string,
  expire_month: number,
  expire_year: number,
  first_name?: string,
  last_name?: string,
  name: string,
  coupon?: string,
  billing_address: Address
}
