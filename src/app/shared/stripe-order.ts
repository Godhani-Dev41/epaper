export interface StripeOrder {
  currency:string,
  coupon?:string,
  customer:string,
  email?:string,
  "items[0][type]"?:string,
  "items[0][parent]"?:string,
  "items[0][amount]"?:string,
  "items[0][quantity]"?:number,
  "metadata[order_id]"?:string,
  "metadata[user_id]"?:string
}
