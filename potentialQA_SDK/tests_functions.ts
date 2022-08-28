import GeneralService, { TesterFunctions } from '../potentialQA_SDK/server_side/general.service';
import { Client, Request } from '@pepperi-addons/debug-server';

import {
    DataIndexTests,
} from '../server-side/tests/api_tests/data_index.test';

import {
    TemplateTests,
} from '../server-side/tests/api_tests/template.test';

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
    return "";//TODO: what should be done here?
}

function camelToSnakeCase(str) {
    return (str.split(/(?=[A-Z])/).join('_').toLowerCase());
}
/**
 * please notice: this test wont run unless you'll change everything needed
 * @param client the client object which received from user 
 * @param request HTTP request received from user
 * @param testerFunctions mocha functions passed from infra 
 * @returns tests result
 */
export async function template_test_endpoint(client: Client, request: Request, testerFunctions: TesterFunctions) {
    const service = new GeneralService(client);
    testName = 'Fill_Test_Name_Here'; //1st thing has to change: this is done for printing: fill your test name here
    service.PrintMemoryUseToLog('Start', testName);
    testerFunctions = service.initiateTesterFunctions(client, testName);
    await TemplateTests(service, request, testerFunctions);//2nd thing has to change: this should be replaced by your testing function
    await test_data(client, testerFunctions);
    return (await testerFunctions.run());
}


/**
 * this is an example you can immediately run - a true full Automation test fromm the automation framework
 * all you have to do is take the 'Run local data_index test' from 'automation_assets/automation_template.postman_collection.json' & run via postman
 */
export async function data_index(client: Client, request, testerFunctions: TesterFunctions) {
    debugger;
    const service = new GeneralService(client);
    testName = 'Data_Index';
    service.PrintMemoryUseToLog('Start', testName);
    testerFunctions = service.initiateTesterFunctions(client, testName);
    await DataIndexTests(service, request, testerFunctions);
    await test_data(client, testerFunctions);
    return (await testerFunctions.run());
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