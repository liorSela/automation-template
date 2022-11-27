import { PapiClient } from '@pepperi-addons/papi-sdk';
//00000000-0000-0000-0000-00000e1a571c
import { DataIndexWhereClauseService } from "./services/dataindexwhereclause.service";
import GeneralService, { TesterFunctions } from "../../potentialQA_SDK/server_side/general.service";


export async function DataIndexWhereClause(generalService: GeneralService, addonService: GeneralService, request, tester: TesterFunctions) {
    const dataObj = request.body.Data; // the 'Data' object passsed inside the http request sent to start the test -- put all the data you need here
    const service = new DataIndexWhereClauseService(generalService, addonService.papiClient, dataObj);
    const describe = tester.describe;
    const expect = tester.expect;
    const it = tester.it;

    describe('Index Tests:', async () => {
        let connector = service.indexType("regular");
        it(`Creation`, async () => {
            console.log(await connector.upsertSchema({}));
        })

        it(`Deletion`, async () => {
            await connector.purgeSchema();
        })
    });

    describe('Shared-Index Tests:', async () => {
        let connector = service.indexType("shared");
        it(`Creation`, async () => {
            console.log(await connector.upsertSchema({}));
        })

        it(`Deletion`, async () => {
            await connector.purgeSchema();
        })
    });
}
