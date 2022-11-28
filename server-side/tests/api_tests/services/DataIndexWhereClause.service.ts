//00000000-0000-0000-0000-00000e1a571c
import {
    FindOptions,
    User,
    PapiClient,
    AddonDataScheme,
    ElasticSearchDocument,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../potentialQA_SDK/server_side/general.service';
import { v4 as uuid } from 'uuid';

type PartialScheme = Omit<AddonDataScheme, "Name" | "Type" | "DataSourceData">;

export interface Connector {
    upsertSchema: (partialScheme: PartialScheme) => Promise<AddonDataScheme>,
    upsertDocument(document: any): any;
    batchUpsertDocuments(documents: any[]): any;
    purgeSchema: () => any;
    getDocuments: (params: FindOptions) => Promise<ElasticSearchDocument[]>;
}

export class DataIndexWhereClauseService {
    papiClient: PapiClient;
    routerClient: PapiClient;
    generalService: GeneralService;
    dataObject: any; // the 'Data' object passsed inside the http request sent to start the test -- put all the data you need here
    addonUUID: string;
    indexSchema: AddonDataScheme;
    sharedIndexSchema: AddonDataScheme;

    constructor(public systemService: GeneralService, public addonService: PapiClient, dataObject: any) {
        this.papiClient = systemService.papiClient; // client which will ALWAYS go OUT
        this.generalService = systemService;
        this.routerClient = addonService; // will run according to passed 'isLocal' flag
        this.dataObject = dataObject;
        this.addonUUID = "02754342-e0b5-4300-b728-a94ea5e0e8f4";
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

    indexType = (type: "regular" | "shared"): Connector => {
        let baseSchema: AddonDataScheme = type === "regular" ? this.indexSchema : this.sharedIndexSchema
        return {
            upsertSchema: (scheme: PartialScheme) => {
                return this.papiClient.addons.data.schemes
                    .post({ ...scheme, ...baseSchema });
            },
            upsertDocument: (document: any) => {
                return this.papiClient.addons.index
                    .uuid(this.addonUUID)
                    .resource(baseSchema.Name)
                    .create(document);
            },
            batchUpsertDocuments: (documents: ElasticSearchDocument[]) => {
                return this.papiClient.addons.index
                    .batch({ Objects: documents })
                    .uuid(this.addonUUID)
                    .resource(baseSchema.Name);
            },
            getDocuments: (params: FindOptions): Promise<ElasticSearchDocument[]> => {
                return this.papiClient.addons.index
                    .uuid(this.addonUUID)
                    .resource(baseSchema.Name)
                    .find(params);
            },
            purgeSchema: () => {
                return this.papiClient
                    .post(`/addons/data/schemes/${baseSchema.Name}/purge`);
            }
        }
    }
}

// export function validateOrderOfResponse(response: ElasticSearchDocument[], orderOfKeys: string[]) {
//     if (response.length === orderOfKeys.length) {
//         let arrayOfKeys = response.map(doc => doc.Key);
//         if (arrayOfKeys.every((val, index) => val === orderOfKeys[index]))
//             return;
//         throw new Error(`Response isn't ordered correctly. Expected: ${orderOfKeys} Got: ${arrayOfKeys}`)
//     }
//     throw new Error(`Response size is incorrect. Expected: ${orderOfKeys.length} Got: ${response.length}`)
// }

export function validateOrderOfResponseBySpecificField(response: ElasticSearchDocument[], fieldName: string, ofTypeBool: boolean = false) {
    let values: any[];
    if (ofTypeBool)
        values = response.map(doc => doc[fieldName] ? 1 : 0);
    else
        values = response.map(doc => doc[fieldName]);
    if (!!values.reduce((n, item) => n !== false && item >= n && item))
        return;
    throw new Error(`Response isn't ordered correctly`);
}
