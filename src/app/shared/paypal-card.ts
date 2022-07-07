import {Address} from './address';

export interface PaypalCard {
  number: string,
  type: string,
  expire_month: number,
  expire_year: number,
  first_name: string,
  last_name: string,
  billing_address: Address
}
