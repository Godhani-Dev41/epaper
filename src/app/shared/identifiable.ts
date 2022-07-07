import * as firebase from "@angular/fire/firestore";
import {Pointer} from "./pointer";
import {Timestamp} from "rxjs";

export interface Identifiable {
  id?: string,
  identifier?: string,
  objectId?: string,
  createdAt?: Date | Timestamp<any>,
  updatedAt?: Date | Timestamp<any>
}
