//00000000-0000-0000-0000-00000e1a571c
import {
    FindOptions,
    User,
    PapiClient,
    AddonDataScheme,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../potentialQA_SDK/server_side/general.service';
import { v4 as uuid } from 'uuid';

export class DataIndexWhereClauseService {
    papiClient: PapiClient;
    routerClient: PapiClient;
    generalService: GeneralService;
    dataObject: any; // the 'Data' object passsed inside the http request sent to start the test -- put all the data you need here
    indexSchema: AddonDataScheme;

    constructor(public systemService: GeneralService, public addonService: PapiClient, dataObject: any) {
        this.papiClient = systemService.papiClient; // client which will ALWAYS go OUT
        this.generalService = systemService;
        this.routerClient = addonService; // will run according to passed 'isLocal' flag
        this.dataObject = dataObject;
        this.indexSchema = {
            Name: "integration-test-schema-" + uuid(),
            Type: "index"
        }
    }

    createIndexSchema() {
        return this.papiClient.addons.data.schemes.post(this.indexSchema);
    }

    purgeIndexSchema() {
        return this.papiClient.post(`/addons/data/schemes/${this.indexSchema.Name}/purge`);
    }
}
