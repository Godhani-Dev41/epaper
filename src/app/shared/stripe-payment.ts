export interface StripePayment {
  coupon?:string,
  customer:string,
  source?:string,
  email?:string,
  applicationFee?:string,
  "metadata[order_id]"?:string,
  "metadata[user_id]"?:string
}
