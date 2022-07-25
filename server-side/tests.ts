import GeneralService, { TesterFunctions } from '../potentialQA_SDK/server_side/general.service';
import { Client, Request } from '@pepperi-addons/debug-server';

import {
    TestDataTests,
    DataIndexTests,
    TemplateTests,
} from './api_tests/index';

let testName = '';


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
export async function data_index(client: Client, request: Request, testerFunctions: TesterFunctions) {
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

