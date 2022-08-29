import {
    PapiClient,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../../potentialQA_SDK/server_side/general.service';

export class TemplateService {
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
