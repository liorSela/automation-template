//10979a11-d7f4-41df-8993-f06bfd778304
import {
    PapiClient,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../../potentialQA_SDK/server_side/general.service';

export class ActivityDataIndexService {
    papiClient: PapiClient;
    generalService: GeneralService;

    constructor(public service: GeneralService) {
        this.papiClient = service.papiClient;
        this.generalService = service;
    }

    //this is a generic example of how service functions usually look like -- you can also check the 'example.objects.service.ts' file for reference
    getResource() {
        let url = '/resource';
        return this.papiClient.get(url);
    }
}
