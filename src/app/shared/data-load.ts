import {Identifiable} from "./identifiable";
import {Paper} from "./paper";
import {Order} from "./order";
import {Subscription} from "./subscription";
import {User} from "./user";
import {Pointer} from "./pointer";

export interface DataLoad extends Identifiable{
  paper: Paper | Pointer,
  order?: Order | Pointer,
  subscription?: Subscription | Pointer,
  createdBy? : User | Pointer
}
