//00000000-0000-0000-0000-000000006a91
import {
    PapiClient,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../potentialQA_SDK/server_side/general.service';
import jwtDecode from "jwt-decode";

export interface GetRecordsRequiringSyncResponse {
    Keys: string[],
    HiddenKeys: string[]
};

export type SystemFilterType = 'None' | 'User' | 'Account';

export interface SystemFilter {
    Type: SystemFilterType,
    AccountKey?: string
};

export interface GetRecordsRequiringSyncParameters {
    AddonUUID: string,
    Resource: string,
    IncludeDeleted: boolean,
    ModificationDateTime?: string,
    SystemFilter?: SystemFilter
};

export class NebulaTestService {
    pnsInsertRecords(testingAddonUUID: string, tableName: string, test_7_items: import("./NebulaPNSEmulator.service").BasicRecord[]) {
        return
    }
    //     try {
    //         return await this.routerClient.post(this.nebulaCypherRelativeURL, {
    //             "Query": cypher
    //         });
    //     }
    //     catch (ex) {
    //         console.error(`Error in sendCypherToNebula: ${ex}`);
    //         throw new Error((ex as { message: string }).message);
    //     }
    // }
    initPNS() {
        return
    }
    pnsUpdateSchemaSyncStatus(testingAddonUUID: string, tableName: string, arg2: boolean) {
        return
    }
    pnsInsertSchema(testingAddonUUID: string, tableName: string) {
        return;
    }
    papiClient: PapiClient;
    routerClient: PapiClient;
    generalService: GeneralService;
    dataObject: any; // the 'Data' object passed inside the http request sent to start the test -- put all the data you need here
    distributorUUID: any;

    constructor(public systemService: GeneralService, public addonService: PapiClient, dataObject: any) {
        this.papiClient = systemService.papiClient; // client which will ALWAYS go OUT
        this.generalService = systemService;
        this.routerClient = addonService; // will run according to passed 'isLocal' flag
        this.dataObject = dataObject;
        this.distributorUUID = (jwtDecode(this.papiClient['options'].token)['pepperi.distributoruuid']).toLowerCase();
    }

    nebulaAddonUUID = '00000000-0000-0000-0000-000000006a91';

    nebulaAsyncRelativeURL = `/addons/api/async/${this.nebulaAddonUUID}`;
    nebulaSyncRelativeURL = `/addons/api/${this.nebulaAddonUUID}`;

    nebulaGetResourcesRequiringSyncRelativeURL = `${this.nebulaSyncRelativeURL}/api/get_resources_requiring_sync`;
    nebulaGetRecordsRequiresSyncRelativeURL = `${this.nebulaSyncRelativeURL}/api/get_record_keys_requiring_sync`;
    nebulaGetRecordsRelativeURL = `${this.nebulaSyncRelativeURL}/inner_endpoints/get_records_of_schema_from_nebula`;

    getRecordLabelFromAddonUUIDAndResource(addonUUID: string, resource: string) {
        return `Record_${this.replaceDashWithUnderscore(this.distributorUUID)}_${this.replaceDashWithUnderscore(addonUUID)}_${resource}`;
    }

    replaceDashWithUnderscore(str: string) {
        return str.replace(/-/g, '_');
    }

    // can no longer be done without Nebula secret key
    // async sendCypherToNebula(cypher: string) {
    //     try {
    //         return await this.routerClient.post(this.nebulaCypherRelativeURL, {
    //             "Query": cypher
    //         });
    //     }
    //     catch (ex) {
    //         console.error(`Error in sendCypherToNebula: ${ex}`);
    //         throw new Error((ex as { message: string }).message);
    //     }
    // }

    async getResourcesRequiringSync(ModificationDateTime: string, IncludeDeleted = false): Promise<{
        AddonUUID: string;
        Resource: string;
        Hidden: boolean;
    }[]> {
        try {
            return (await this.routerClient.post(this.nebulaGetResourcesRequiringSyncRelativeURL, {
                "ModificationDateTime": ModificationDateTime,
                "IncludeDeleted": IncludeDeleted
            })).results;
        }
        catch (ex) {
            console.error(`Error in getSchemasRequiringSync: ${ex}`);
            throw new Error((ex as { message: string }).message);
        }
    }

    async getRecordsRequiringSync(parameters: GetRecordsRequiringSyncParameters): Promise<GetRecordsRequiringSyncResponse> {
        try {
            return await this.routerClient.post(`${this.nebulaGetRecordsRequiresSyncRelativeURL}?addon_uuid=${parameters.AddonUUID}&resource=${parameters.Resource}`, {
                "ModificationDateTime": parameters.ModificationDateTime,
                "IncludeDeleted": parameters.IncludeDeleted,
                "SystemFilter": parameters.SystemFilter
            });
        }
        catch (ex) {
            console.error(`Error in getRecordsRequiringSync: ${ex}`);
            throw new Error((ex as { message: string }).message);
        }
    }

    async getRecordsFromNebula(addonUUID: string, resource: string) {
        const body = {
            AddonUUID: addonUUID,
            Name: resource,
        }

        try {
            return await this.routerClient.post(this.nebulaGetRecordsRelativeURL, body);
        }
        catch (error) {
            console.error(`Error in getRecordsFromNebula: ${(error as Error).message}`);
            throw error;
        }
    }

    // wait for x seconds depending on the current PNS delay time
    async waitForPNS() {
        const pnsDelaySeconds = 30;
        console.log(`Waiting for ${pnsDelaySeconds} seconds for PNS to catch up...`);
        await this.generalService.sleep(pnsDelaySeconds * 1000);
        console.log(`Done waiting for PNS`);
    }
}
