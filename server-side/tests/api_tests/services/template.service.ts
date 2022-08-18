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
}
