#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const fs = require("fs");
const fetch = require("node-fetch");
const { exit } = require('process');
const cwd = process.cwd();


const templateTestPath = "../server-side/tests/api_tests/template.test.ts";
const templateServicePath = "../server-side/tests/api_tests/services/template.service.ts";
const serviceLoaction = "../server-side/tests/api_tests/services";
const endpointToAddTemplate = `
export async function template_test_endpoint(client: Client, request: Request, testerFunctions: TesterFunctions) {
    const service = new GeneralService(client);
    testName = 'Fill_Test_Name_Here'; //printing your test name - done for logging
    service.PrintMemoryUseToLog('Start', testName);
    testerFunctions = service.initiateTesterFunctions(client, testName);
    await TemplateTests(service, request, testerFunctions);//this is the call to YOUR test function
    await test_data(client, testerFunctions);//this is done to print versions at the end of test - can be deleted
    return (await testerFunctions.run());
};
context["template_test_endpoint"] = template_test_endpoint;
`;
const templateTestImport = `import { Template } from '../server-side/tests/api_tests/Template.test';`;
const templateServiceImport = `import { ServiceName } from "Path";`;
const templateCtorLineToReplace = `//ctor replacment line`;
const abc = `const service = new serviceClass(generalService);`;

const addonUUIDMapper = '../potentialQA_SDK/mapper.json';
const serverSideTestsEndpointsLocation = '../potentialQA_SDK/tests_functions.ts';
program
    .name('test-creator')
    .description('CLI to create tests templates')
    .version('0.0.1');

program.command('server-side')
    .description('Create a template for server side test')
    .argument('<addonUUID>', 'tested addon UUID')
    //   .option('--first', 'display just the first substring')
    //   .option('-s, --separator <char>', 'separator character', ',')
    .action(async (addonUUID) => {
        if(isAddonAlreadyTested(addonUUID)){
            console.log(`Error: The Addon ${addonUUID} Is Already Has Its Test File - Search For '${addonUUID}' in VSC search`);
            exit(1);
        }
        if (!process.env.VAR_USER) {
            console.log(`Error: VAR_USER Env Variable Is Not Configured!`);
            exit(1);
        }
        const varUser = process.env.VAR_USER;
        let res;
        try {
            res = await (getAddonNameByUUID(addonUUID, varUser));
        } catch (e) {
            console.log(`Error: Cannot Receive Addon Name By Given UUID: ${(e)}`);
            exit(1);
        }
        let addonName = res[0].Name;
        console.log(`Addon Name Received For Provided UUID: ${addonUUID} is: ${addonName}`);
        addonName = camelize(addonName.toLowerCase());
        // 1. create a new test service
        let serviceClassName = `${addonName.charAt(0).toUpperCase() + addonName.slice(1)}`;
        let testClassName = `${addonName.charAt(0).toUpperCase() + addonName.slice(1)}`;
        const newServiceFileName = `${serviceLoaction}/${serviceClassName}.service.ts`;
        copyFileAndChangeContent(templateServicePath, 'TemplateService', `${serviceClassName}Service`, newServiceFileName);
        // 1.2. add the tested addon UUID as a comment at the top of the file
        addContentStartOfFile(`//${addonUUID}`, newServiceFileName);
        serviceClassName = `${serviceClassName}Service`;
        //2. create a new test file for requested addon
        const newTestFileName = `./tests/api_tests/${testClassName}.test.ts`;
        copyFileAndChangeContent(templateTestPath, 'TemplateTests', testClassName, newTestFileName);
        //2.1. add service import on top of the test file
        const servicePathToImport = `./services/${addonName}.service`;
        let newServiceImport = templateServiceImport.replace(/Path/, servicePathToImport);
        newServiceImport = newServiceImport.replace(/ServiceName/, `${serviceClassName}`);
        const pathToTestFile = `../server-side/tests/api_tests/${addonName}.test.ts`;
        addContentStartOfFile(newServiceImport, pathToTestFile);
        //2.2. add the tested addon UUID as a comment at the top of the file
        addContentStartOfFile(`//${addonUUID}`, pathToTestFile);
        //2.3 replace template line with new service ctor
        let newCtorToTemplate = abc.replace(/service/, `${addonName}Service`);
        newCtorToTemplate = newCtorToTemplate.replace(/serviceClass/, `${addonName.charAt(0).toUpperCase() + addonName.slice(1)}Service`);
        // console.log(newCtorToTemplate);
        copyFileAndChangeContent(pathToTestFile, '//templateToTeplaceWithCtor', newCtorToTemplate, pathToTestFile);
        //3.add addon name to map to addon UUID inside 'mapper.json'
        //uuid:name
        const addonUUIDNameMapping = `"${addonUUID}":"${addonName}",\n\t"templateLine":"Template"`;
        copyFileAndChangeContent(addonUUIDMapper, `"templateLine":"Template"`, addonUUIDNameMapping, addonUUIDMapper);
        //3. add the new test file to this addon endpoint
        let newEndpoint = endpointToAddTemplate.replace(/template_test_endpoint/g, camelToSnakeCase(testClassName));
        newEndpoint = newEndpoint.replace(/TemplateTests/g, testClassName);
        newEndpoint = newEndpoint.replace(/Fill_Test_Name_Here/g, testClassName);
        AddContentToFile(serverSideTestsEndpointsLocation, newEndpoint);
        //3.1. add import to new test function to work in test endpoints
        const newTestImportLine = templateTestImport.replace(/Template/g, testClassName);
        addContentStartOfFile(newTestImportLine, serverSideTestsEndpointsLocation);
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
    fs.writeFileSync(destFilePath, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
}

function AddContentToFile(srcFilePath, stringToAdd) {
    fs.appendFileSync(srcFilePath, stringToAdd, function (err) {
        if (err) {
            console.error(err);
        }
    });
}


function camelToSnakeCase(str) {
    return (str.split(/(?=[A-Z])/).join('_').toLowerCase());
}

function addContentStartOfFile(textToAdd, fileToAddTo) {
    let endpointFileSplitted = fs.readFileSync(fileToAddTo).toString().split('\n');
    endpointFileSplitted.unshift(textToAdd);
    fs.writeFileSync(fileToAddTo, endpointFileSplitted.join('\n'));
}

async function getAddonNameByUUID(addonUUID, VARuser) {
    if (addonUUID.length !== 36) {
        throw `Provided UUID Is Too Short: '${addonUUID}'`;
    }
    const base64Credentials = Buffer.from(VARuser).toString('base64');
    const response = await fetch(`https://papi.pepperi.com/V1.0/var/addons?where=UUID='${addonUUID}'`, {
        headers: {
            Authorization: `Basic ` + base64Credentials,
        }
    });
    const responseJson = await response.json();
    if (responseJson.length < 1) {
        throw `No Addons Returned For The Provided UUID '${addonUUID}'`;
    }
    return responseJson;
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function isAddonAlreadyTested(addonUUID){
    let addonUUIDMapper = JSON.parse(fs.readFileSync("../potentialQA_SDK/mapper.json", 'utf-8'));
    for (let [key, _] of Object.entries(addonUUIDMapper)) {
        if (key === addonUUID) {
            return true;
        }
    }
    return false;
}
