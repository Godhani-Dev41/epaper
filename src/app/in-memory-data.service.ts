import {Injectable} from '@angular/core';
import {InMemoryDbService, ResponseOptions, STATUS} from 'angular-in-memory-web-api';
import {RequestInfo} from 'angular-in-memory-web-api/interfaces';

@Injectable()
export class InMemoryDataService implements InMemoryDbService {

    public createDb() {
        return [];
    }

    public get(reqInfo: RequestInfo) {
        const request: Request = reqInfo.req as Request;
        const collectionName = reqInfo.collectionName;

        const requestUrl: String = request.url;
        const requestUrlParts: string[] = requestUrl.split('/');
        const requestUrlLastPart: string = requestUrlParts[requestUrlParts.length - 1];
        const query = reqInfo.query;
        console.log(requestUrl, query );

        if (collectionName === 'criteria') {
            if (requestUrlLastPart.indexOf('login') !== -1) {

            }

        }

        return undefined; // let the default GET handle all others
    }

}
