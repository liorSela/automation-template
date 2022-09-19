import { TesterFunctions } from './potentialQA_SDK/server_side/general.service';
import { Client } from '@pepperi-addons/debug-server';

import { runTest } from './potentialQA_SDK/tests_functions';

/**
 * please notice: this test wont run unless you'll change everything needed
 * @param client the client object which received from user 
 * @param request HTTP request received from user
 * @param testerFunctions mocha functions passed from infra 
 * @returns tests result
 */
export async function run(client: Client, request: any, testerFunctions: TesterFunctions) {
    console.log(`asked to run ${request.body.AddonUUID} tests`);
    await runTest(request.body.AddonUUID, client, request, testerFunctions);
}
