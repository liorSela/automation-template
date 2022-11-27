//00000000-0000-0000-0000-00000e1a571c
import {
    FindOptions,
    User,
    PapiClient,
    AddonDataScheme,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../potentialQA_SDK/server_side/general.service';
import { v4 as uuid } from 'uuid';

type PartialScheme = Omit<AddonDataScheme, "Name" | "Type" | "DataSourceData">;

export class DataIndexWhereClauseService {
    papiClient: PapiClient;
    routerClient: PapiClient;
    generalService: GeneralService;
    dataObject: any; // the 'Data' object passsed inside the http request sent to start the test -- put all the data you need here
    indexSchema: AddonDataScheme;
    sharedIndexSchema: AddonDataScheme;

    constructor(public systemService: GeneralService, public addonService: PapiClient, dataObject: any) {
        this.papiClient = systemService.papiClient; // client which will ALWAYS go OUT
        this.generalService = systemService;
        this.routerClient = addonService; // will run according to passed 'isLocal' flag
        this.dataObject = dataObject;
        this.indexSchema = {
            Name: "integration-test-regular-index-" + uuid(),
            Type: "index"
        }
        this.sharedIndexSchema = {
            Name: "integration-test-schema-of-shared-index-" + uuid(),
            Type: "shared_index",
            DataSourceData: {
                IndexName: "integration-test-shared-index-" + uuid()
            }
        }
    }

    indexType = (type: "regular" | "shared") => {
        let baseSchema: AddonDataScheme = type === "regular" ? this.indexSchema : this.sharedIndexSchema
        return {
            upsertSchema: (scheme: PartialScheme) => {
                return this.papiClient.addons.data.schemes.post({ ...scheme, ...baseSchema });
            },
            purgeSchema: () => {
                return this.papiClient.post(`/addons/data/schemes/${baseSchema.Name}/purge`);
            }
        }
    }
}
