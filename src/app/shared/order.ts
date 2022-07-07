import {Identifiable} from './identifiable';
import {Pointer} from "./pointer";
import {Paper} from "./paper";
import {Subscription} from "./subscription";

export interface Order extends Identifiable {
  id? :string,
  paper?: Paper | Pointer,
  subscription?: Subscription | Pointer,
  type?: string,
  data?: any,
  license?: string,
  isActive?: boolean,
  autoRecharge?:boolean,
  downloads?:number,
  dataLoads?:number,
  customerId?:string,
  createdBy?: Pointer
}
