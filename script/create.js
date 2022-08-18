#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const fs = require("fs");
const cwd = process.cwd();

const templateTestPath = "../server-side/tests/api_tests/template.test.ts";
const templateServicePath = "../server-side/tests/api_tests/services/template.service.ts";
const serviceLoaction = "../server-side/tests/api_tests/services";
const endpointToAddTemplate = `
export async function template_test_endpoint(client: Client, request: Request, testerFunctions: TesterFunctions) {
    const service = new GeneralService(client);
    testName = 'Fill_Test_Name_Here'; //1st thing has to change: this is done for printing: fill your test name here
    service.PrintMemoryUseToLog('Start', testName);
    testerFunctions = service.initiateTesterFunctions(client, testName);
    await TemplateTests(service, request, testerFunctions);//2nd thing has to change: this should be replaced by your testing function
    await test_data(client, testerFunctions);
    return (await testerFunctions.run());
}
`;
const templateImport = `import { Template } from './tests/api_tests/Template.test';`;

const serverSideTestsEndpointsLocation = '../server-side/server.tests.ts';
program
    .name('test-creator')
    .description('CLI to create tests templates')
    .version('0.0.1');

program.command('server-side')
    .description('Create a template for server side test')
    .argument('tested addon name')
    //   .option('--first', 'display just the first substring')
    //   .option('-s, --separator <char>', 'separator character', ',')
    .action((addonName) => {
        console.log(addonName);
        //1. create a new test file for requested addon
        const newTestFileName = `./tests/api_tests/${addonName}.test.ts`;
        copyFileAndChangeContent(templateTestPath, 'TemplateTests', addonName, newTestFileName);
        //2. create a new test service
        const newServiceFileName = `${serviceLoaction}/${addonName}.service.ts`;
        copyFileAndChangeContent(templateServicePath, 'TemplateService', addonName, newServiceFileName);
        //3. add the new test file to this addon endpoint
        let newEndpoint = endpointToAddTemplate.replace(/template_test_endpoint/g, camelToSnakeCase(addonName));
        newEndpoint = newEndpoint.replace(/TemplateTests/g, addonName);
        AddContentToFile(serverSideTestsEndpointsLocation, newEndpoint);
        //3.1. add import to new test function to work in test endpoints
        const newTestImportLine = templateImport.replace(/Template/g, addonName);
        let endpointFileSplitted = fs.readFileSync(serverSideTestsEndpointsLocation).toString().split('\n');
        endpointFileSplitted.unshift(newTestImportLine);
        fs.writeFileSync(serverSideTestsEndpointsLocation, endpointFileSplitted.join('\n'));
        // AddContentToFile(serverSideTestsEndpointsLocation, newTestImportLine);
    });


program.parse();





// const writeStream = fs.createWriteStream(`${addonName}.txt`);
// writeStream.write("Hi, JournalDEV Users. ");
// writeStream.write("Thank You.");
// writeStream.end();

function copyFileAndChangeContent(srcFilePath, placeholderToChange, stringToChangeTo, destFilePath) {
    let data = '';
    try {
        data = fs.readFileSync(srcFilePath, 'utf8');
    } catch (err) {
        console.error(err);
    }
    var re = new RegExp(placeholderToChange, 'g');
    let result = data.replace(re, `${stringToChangeTo}`);
    fs.writeFile(destFilePath, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
}

function AddContentToFile(srcFilePath, stringToAdd) {
    fs.appendFile(srcFilePath, stringToAdd, function (err) {
        if (err) {
            console.error(err);
        }
    });
}


function camelToSnakeCase(str) {
    return (str.split(/(?=[A-Z])/).join('_').toLowerCase());
}