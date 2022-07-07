import {StripeSource} from './stripe-source';

export interface StripeCustomer {
  id?: string,
  account_balance?: string,
  business_vat_id?: string,
  coupon?: string,
  default_source?: string,
  description?: string,
  phone?: string,
  email?: string,
  invoice_prefix?: string,
  metadata?: string,
  livemode?: any,
  created?: number,
  object?: string,
  currency?: string,
  source?: string | StripeSource
}
