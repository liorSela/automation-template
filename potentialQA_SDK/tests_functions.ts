import { ActivityDataIndex } from '../server-side/tests/api_tests/ActivityDataIndex.test';
import GeneralService, { TesterFunctions } from '../potentialQA_SDK/server_side/general.service';
import { Client, Request } from '@pepperi-addons/debug-server';

import { TestDataTests } from '../potentialQA_SDK/server_side/serverInfra.index';
import fs from 'fs';

let testName = '';
let context = {};

export async function runTest(addonUUID: string, client: Client, request, testerFunctions: TesterFunctions) {
    if (addonUUID.length !== 36) {
        throw Error(`Error: ${addonUUID} Is Not A Valid Addon UUID`);
    }
    const functionName = mapUuidToTestName(addonUUID);
    if (functionName === "") {
        throw Error(`Error: No Test For Addon UUID ${addonUUID} Is Existing`);
    }
    if (request.body.isLocal === undefined) {
        throw Error("Error: isLocal is Mandatory Field Inside Test Request Body");
    }
    if (request.body.isLocal === "true") {
        client.BaseURL = "http://localhost:4500";
    }
    return await context[functionName].apply(this, [client, request, testerFunctions]);
}

function mapUuidToTestName(addonUUID: string): string {
    let addonUUIDMapper = JSON.parse(fs.readFileSync('../potentialQA_SDK/mapper.json', 'utf-8'));
    for (let [key, value] of Object.entries(addonUUIDMapper)) {
        if (key === addonUUID) {
            return camelToSnakeCase(value) as string;
        }
    }
    return "";
}

function camelToSnakeCase(str) {
    return (str.split(/(?=[A-Z])/).join('_').toLowerCase());
}

//this function is infra function to print addon versions - DO NOT TOUCH
export async function test_data(client: Client, testerFunctions: TesterFunctions) {
    const service = new GeneralService(client);
    if (testName == '') {
        testName = 'Test_Data';
        service.PrintMemoryUseToLog('Start', testName);
        testerFunctions = service.initiateTesterFunctions(client, testName);
        const testResult = await Promise.all([await test_data(client, testerFunctions)]).then(() =>
            testerFunctions.run(),
        );
        service.PrintMemoryUseToLog('End', testName);
        testName = '';
        return testResult;
    } else {
        return TestDataTests(service, testerFunctions);
    }
}

/**
 * this is an example you can immediately run - a true full Automation test fromm the automation framework
 * all you have to do is take the 'Run local data_index test' from 'automation_assets/automation_template.postman_collection.json' & run via postman
 */
export async function activity_data_index(client: Client, request: Request, testerFunctions: TesterFunctions) {
    const service = new GeneralService(client);
    testName = 'ActivityDataIndex'; //printing your test name - done for logging
    service.PrintMemoryUseToLog('Start', testName);
    testerFunctions = service.initiateTesterFunctions(client, testName);
    await ActivityDataIndex(service, request, testerFunctions);//this is the call to YOUR test function
    await test_data(client, testerFunctions);//this is done to print versions at the end of test - can be deleted
    return (await testerFunctions.run());
};
context["activity_data_index"] = activity_data_index;