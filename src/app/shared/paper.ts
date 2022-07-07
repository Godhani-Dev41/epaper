import {Identifiable} from './identifiable';
import {Pointer} from "./pointer";
import {Option} from "./option";
import {Post} from "./post";

export interface Paper extends Identifiable {
  id? :string,
  preferredLanguage?: any[],
  interests?: any[],
  networks?: any[],
  websites?: any[],
  people?: any[],
  webPages?: any[],
  organizations?: any[],
  countries?: any[],
  keywords?: any[],
  createdBy: Pointer,
  downloads?: number,
  posts?: Post[],
  type?: String,
  includePhotos?: boolean,
  platforms?: any[]
}
