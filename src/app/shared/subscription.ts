import {Identifiable} from "./identifiable";

export interface Subscription extends Identifiable{
  id? :string,
  price:number,
  name:string,
  downloads:number,
  papers:number,
  dataLoads:number,
  articleMax:number
}
