//00000000-0000-0000-0000-000000006a91
import { NebulaTestService } from "./services/nebulatest.service";
import GeneralService, { TesterFunctions } from "../../potentialQA_SDK/server_side/general.service";
import { PerformanceManager } from "./services/performance_management/performance_manager";
import { ResourceManagerService } from "./services/resource_management/resource_manager.service";
import { AddonData, AddonDataScheme } from "@pepperi-addons/papi-sdk";
import { ADALTableService } from "./services/resource_management/adal_table.service";
import { v4 as uuidv4 } from 'uuid';
import { NebulaLocalFunctions } from "./services/NebulaLocalFunctions.service";
import { AddonUUID as testingAddonUUID } from "../../../addon.config.json";
import { BasicRecord } from "./services/NebulaPNSEmulator.service";

function getShortUUID(): string {
    return uuidv4().split('-')[0];
}

export async function NebulaTest(generalService: GeneralService, addonService: GeneralService, request, tester: TesterFunctions) {
    const dataObj = request.body.Data; // the 'Data' object passed inside the http request sent to start the test -- put all the data you need here
    //setting 'mocha verbs' to use
    const describe = tester.describe;
    const expect = tester.expect;
    const it = tester.it;
    const automationAddonUUID = "02754342-e0b5-4300-b728-a94ea5e0e8f4";

    describe('NebulaTest Suites', () => { //the string inside the describe will effect the title of this suite in the report
        const nebulatestService = new NebulaTestService(generalService, addonService.papiClient, dataObj);
        //const nebulatestService = new NebulaLocalFunctions(generalService, addonService.papiClient, dataObj);
        const performanceManager: PerformanceManager = new PerformanceManager();
        const resourceManager: ResourceManagerService = new ResourceManagerService(addonService.papiClient, automationAddonUUID);

        // it(`first clean of PNS`, async () => {
        //     await nebulatestService.initPNS();
        //     //const originalBaseURL = nebulatestService.papiClient['options'].baseURL;
        //     //nebulatestService.papiClient['options'].baseURL = "";
        //     //await nebulatestService.papiClient.post('http://localhost:4500/pns_endpoints/foo', { hello: "world" });
        //     //await nebulatestService.papiClient.post('http://localhost:4500/pns_endpoints/foo', { hello: "world" });
        //     //nebulatestService.papiClient['options'].baseURL = originalBaseURL;
        // });

        it(`Create ADAL schema with sync=true, add items, wait for 16 seconds and check if nebula has the records`, async () => {
            performanceManager.startMeasure(`Test 1`, `Create ADAL schema with sync=true, add items, wait for 16 seconds and check if nebula has the records`);

            const tableName = "nebulaTestTable1" + getShortUUID();
            // create ADAL schema with sync=true
            const test_1_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" } // no need key
                }
                ,
                "SyncData": {
                    "Sync": true
                }
            }

            // create ADAL table
            const test_1_table_service: ADALTableService = await resourceManager.createAdalTable(test_1_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_1_table_service`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // add 10 items to the table
            const test_1_items: BasicRecord[] = [];
            for (let i = 0; i < 10; i++) {
                test_1_items.push({
                    Key: `test_1_item_${i}`,
                    StringProperty: `test_1_item_${i}`
                });
            }
            await test_1_table_service.upsertBatch(test_1_items);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_1_items);
            console.log(`added items to table test_1_table_service: ${JSON.stringify(test_1_items)}`);

            // wait for PNS to notify nebula about the new items
            await nebulatestService.waitForPNS();

            // get nodes of test_1_table from nebula:
            const nodes: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes: ${JSON.stringify(nodes)}`);

            // check if nebula has the records (unordered)
            expect(nodes.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(nodes.find(node => node.Key === `test_1_item_${i}`)).to.not.equal(undefined);
            }
            performanceManager.stopMeasure("Test 1");
        });

        it(`Create ADAL schema with sync=false, add items, check to see that nebula doesn't hold the records, set sync=true, wait for 16 seconds and check if nebula has the records`, async () => {
            performanceManager.startMeasure("Test 2", `Create ADAL schema with sync=false, add items, check to see that nebula doesn't hold the records, set sync=true, wait for 16 seconds and check if nebula has the records`);

            const tableName = "nebulaTestTable2" + getShortUUID();
            // create ADAL schema with sync=true
            const test_2_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                }
                ,
                "SyncData": {
                    "Sync": false
                }
            }

            // create ADAL table
            const test_2_table_service: ADALTableService = await resourceManager.createAdalTable(test_2_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_2_table_service`);

            // add 10 items to the table
            const test_2_items: AddonData[] = [];
            for (let i = 0; i < 10; i++) {
                test_2_items.push({
                    Key: `test_2_item_${i}`,
                    StringProperty: `test_2_item_${i}`
                });
            }

            await test_2_table_service.upsertBatch(test_2_items);
            console.log(`added items to table test_2_table_service: ${JSON.stringify(test_2_items)}`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // get nodes of test_2_table from nebula:
            const nodes_before_sync: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes_before_sync: ${JSON.stringify(nodes_before_sync)}`);

            // check that nebula doesn't have the records
            expect(nodes_before_sync.length).to.equal(0);

            // set sync=true
            const newSchema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                }
                ,
                "SyncData": {
                    "Sync": true
                }
            }
            await test_2_table_service.updateSchema(newSchema);
            await nebulatestService.pnsUpdateSchemaSyncStatus(testingAddonUUID, tableName, true);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // get nodes of test_2_table from nebula:
            const nodes_after_sync: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes_after_sync: ${JSON.stringify(nodes_after_sync)}`);

            // check if nebula has the records (unordered)
            expect(nodes_after_sync.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(nodes_after_sync.find(node => node.Key === `test_2_item_${i}`)).to.not.equal(undefined);
            }
            performanceManager.stopMeasure("Test 2");
        });

        it(`Create ADAL schema with sync=true, add items, wait for 16 seconds and check if nebula has the records, set sync=false, check to see that nebula doesn't hold the records`, async () => {
            performanceManager.startMeasure("Test 7", `Create ADAL schema with sync=true, add items, wait for 16 seconds and check if nebula has the records, set sync=false, check to see that nebula doesn't hold the records`);

            const tableName = "nebulaTestTable7" + getShortUUID();
            // create ADAL schema with sync=true
            const test_7_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                }
                ,
                "SyncData": {
                    "Sync": true
                }
            }

            // create ADAL table
            const test_7_table_service: ADALTableService = await resourceManager.createAdalTable(test_7_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_7_table_service`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // add 10 items to the table
            const test_7_items: BasicRecord[] = [];
            for (let i = 0; i < 10; i++) {
                test_7_items.push({
                    Key: `test_7_item_${i}`,
                    StringProperty: `test_7_item_${i}`
                });
            }

            await test_7_table_service.upsertBatch(test_7_items);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_7_items);
            console.log(`added items to table test_7_table_service: ${JSON.stringify(test_7_items)}`);

            // wait for PNS to notify nebula about the new items
            await nebulatestService.waitForPNS();

            // get nodes of test_7_table from nebula:
            const nodes_before_sync: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes_before_sync: ${JSON.stringify(nodes_before_sync)}`);

            // check that nebula has the records
            expect(nodes_before_sync.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(nodes_before_sync.find(node => node.Key === `test_7_item_${i}`)).to.not.equal(undefined);
            }

            // set sync=false
            const newSchema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                }
                ,
                "SyncData": {
                    "Sync": false
                }
            }
            await test_7_table_service.updateSchema(newSchema);
            await nebulatestService.pnsUpdateSchemaSyncStatus(testingAddonUUID, tableName, false);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // get nodes of test_7_table from nebula:
            const nodes_after_sync: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes_after_sync: ${JSON.stringify(nodes_after_sync)}`);

            // check if nebula doesn't have the records
            expect(nodes_after_sync.length).to.equal(0);
            performanceManager.stopMeasure("Test 7");
        });

        it(`Create ADAL schema with sync=true, wait for PNS, save current time X, and add records. get resources requiring sync using X, and should find the resource. get records requiring sync using X and should find the records. save current time Y, and get resources requiring sync using Y, and should not find the resource. get records requiring sync using Y and should not find the records. add records, wait for PNS, and get records requiring sync using Y and should find only the new records.`, async () => {
            performanceManager.startMeasure("Test 3", `Create ADAL schema with sync=true, wait for PNS, save current time X, and add records. get resources requiring sync using X, and should find the resource. get records requiring sync using X and should find the records. save current time Y, and get resources requiring sync using Y, and should not find the resource. get records requiring sync using Y and should not find the records. add records, wait for PNS, and get records requiring sync using Y and should find only the new records.`);

            const tableName = "nebulaTestTable3" + getShortUUID();
            // create ADAL schema with sync=true
            const test_3_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                }
                ,
                "SyncData": {
                    "Sync": true
                }
            }

            // create ADAL table
            const test_3_table_service: ADALTableService = await resourceManager.createAdalTable(test_3_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_3_table_service`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // save current time X
            const currentTimeX = new Date().toISOString();

            // add 10 items to the table
            const test_3_items: BasicRecord[] = [];
            for (let i = 0; i < 10; i++) {
                test_3_items.push({
                    Key: `test_3_item_${i}`,
                    StringProperty: `test_3_item_${i}`
                });
            }

            await test_3_table_service.upsertBatch(test_3_items);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_3_items);
            console.log(`added items to table test_3_table_service: ${JSON.stringify(test_3_items)}`);

            // wait for PNS to notify nebula about the new items
            await nebulatestService.waitForPNS();

            // get resources requiring sync using X
            const resourcesRequiringSyncX = await nebulatestService.getResourcesRequiringSync(currentTimeX);
            console.log(`resourcesRequiringSyncX: ${JSON.stringify(resourcesRequiringSyncX)}`);

            // check that the resource is in the list
            expect(resourcesRequiringSyncX.find(resource => resource.Resource === tableName)).to.not.equal(undefined);

            // get records requiring sync using X
            const recordsRequiringSyncX = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeX);
            console.log(`recordsRequiringSyncX: ${JSON.stringify(recordsRequiringSyncX)}`);

            // check that the records are in the list
            expect(recordsRequiringSyncX.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(recordsRequiringSyncX.find(record => record.Key === `test_3_item_${i}`)).to.not.equal(undefined);
            }

            // save current time Y
            const currentTimeY = new Date().toISOString();

            // get resources requiring sync using Y
            const resourcesRequiringSyncY = await nebulatestService.getResourcesRequiringSync(currentTimeY);
            console.log(`resourcesRequiringSyncY: ${JSON.stringify(resourcesRequiringSyncY)}`);

            // check that the resource is not in the list
            expect(resourcesRequiringSyncY.find(resource => resource.Resource === tableName)).to.equal(undefined);

            // get records requiring sync using Y
            const recordsRequiringSyncY = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeY);
            console.log(`recordsRequiringSyncY: ${JSON.stringify(recordsRequiringSyncY)}`);

            // check that the records are not in the list
            expect(recordsRequiringSyncY.length).to.equal(0);

            // add 10 items to the table
            const test_3_items2: BasicRecord[] = [];
            for (let i = 10; i < 20; i++) {
                test_3_items2.push({
                    Key: `test_3_item_${i}`,
                    StringProperty: `test_3_item_${i}`
                });
            }

            await test_3_table_service.upsertBatch(test_3_items2);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_3_items2);
            console.log(`added items to table test_3_table_service: ${JSON.stringify(test_3_items2)}`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // get records requiring sync using Y
            const recordsRequiringSyncY2 = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeY);
            console.log(`recordsRequiringSyncY2: ${JSON.stringify(recordsRequiringSyncY2)}`);

            // check that the records are in the list
            expect(recordsRequiringSyncY2.length).to.equal(10);
            for (let i = 10; i < 20; i++) {
                expect(recordsRequiringSyncY2.find(record => record.Key === `test_3_item_${i}`)).to.not.equal(undefined);
            }

            performanceManager.stopMeasure("Test 3");
        });

        it(`Create ADAL schema, wait for PNS, add items with Hidden=true, get resources requiring sync, and should not find the resource. get records requiring sync, and should not find the records. Get  them again with IncludeDeleted = true, and should find the records and resource.`, async () => {
            performanceManager.startMeasure("Test 4", `Create ADAL schema, wait for PNS, add items with Hidden=true, get resources requiring sync, and should not find the resource. get records requiring sync, and should not find the records. Get  them again with IncludeDeleted = true, and should find the records and resource.`);

            const tableName = "nebulaTestTable4" + getShortUUID();
            // create ADAL schema
            const test_4_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                },
                "SyncData": {
                    "Sync": true
                }
            }

            // create ADAL table
            const test_4_table_service: ADALTableService = await resourceManager.createAdalTable(test_4_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_4_table_service`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // save current time X
            const currentTimeX = new Date().toISOString();

            // add 10 items to the table
            const test_4_items: BasicRecord[] = [];
            for (let i = 0; i < 10; i++) {
                test_4_items.push({
                    Key: `test_4_item_${i}`,
                    StringProperty: `test_4_item_${i}`,
                    Hidden: true
                });
            }

            await test_4_table_service.upsertBatch(test_4_items);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_4_items);
            console.log(`added items to table test_4_table_service: ${JSON.stringify(test_4_items)}`);

            // get resources requiring sync using X
            const resourcesRequiringSyncX = await nebulatestService.getResourcesRequiringSync(currentTimeX);
            console.log(`resourcesRequiringSyncX: ${JSON.stringify(resourcesRequiringSyncX)}`);

            // check that the resource is not in the list
            expect(resourcesRequiringSyncX.find(resource => resource.Resource === tableName)).to.equal(undefined);

            // get records requiring sync using X
            const recordsRequiringSyncX = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeX);
            console.log(`recordsRequiringSyncX: ${JSON.stringify(recordsRequiringSyncX)}`);

            // check that the records are not in the list
            expect(recordsRequiringSyncX.length).to.equal(0);

            // get resources requiring sync using X with IncludeDeleted = true
            const resourcesRequiringSyncX2 = await nebulatestService.getResourcesRequiringSync(currentTimeX, true);
            console.log(`resourcesRequiringSyncX2: ${JSON.stringify(resourcesRequiringSyncX2)}`);

            // check that the resource is in the list
            expect(resourcesRequiringSyncX2.find(resource => resource.Resource === tableName)).to.not.equal(undefined);

            // get records requiring sync using X with IncludeDeleted = true
            const recordsRequiringSyncX2 = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeX, true);
            console.log(`recordsRequiringSyncX2: ${JSON.stringify(recordsRequiringSyncX2)}`);

            // check that the records are in the list
            expect(recordsRequiringSyncX2.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(recordsRequiringSyncX2.find(record => record.Key === `test_4_item_${i}`)).to.not.equal(undefined);
            }

            performanceManager.stopMeasure("Test 4");
        });

        it(`same as the first tests only the table name contains an underscore`, async () => {
            performanceManager.startMeasure("Test 5", `same as the first tests only the table name contains an underscore`);

            const tableName = "nebula_Test_Table_5" + getShortUUID();
            // create ADAL schema
            const test_5_schema: AddonDataScheme = {
                "Name": tableName,
                "Type": "data",
                "Fields":
                {
                    StringProperty: { Type: "String" },
                    Key: { Type: "String" }
                },
                "SyncData": {
                    "Sync": true
                }
            }

            // create ADAL table
            const test_5_table_service: ADALTableService = await resourceManager.createAdalTable(test_5_schema);
            await nebulatestService.pnsInsertSchema(testingAddonUUID, tableName);
            console.log(`created table test_5_table_service`);

            // wait for PNS to notify nebula about the new schema
            await nebulatestService.waitForPNS();

            // init PNS
            await nebulatestService.initPNS();

            // add 10 items to the table
            const test_5_items: BasicRecord[] = [];
            for (let i = 0; i < 10; i++) {
                test_5_items.push({
                    Key: `test_5_item_${i}`,
                    StringProperty: `test_5_item_${i}`
                });
            }

            await test_5_table_service.upsertBatch(test_5_items);
            await nebulatestService.pnsInsertRecords(testingAddonUUID, tableName, test_5_items);
            console.log(`added items to table test_5_table_service: ${JSON.stringify(test_5_items)}`);

            // wait for PNS to notify nebula about the new items
            await nebulatestService.waitForPNS();

            // get nodes of test_5_table from nebula:
            const nodes: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
            console.log(`nodes: ${JSON.stringify(nodes)}`);

            // check if nebula has the records (unordered)
            expect(nodes.length).to.equal(10);
            for (let i = 0; i < 10; i++) {
                expect(nodes.find(node => node.Key === `test_5_item_${i}`)).to.not.equal(undefined);
            }
            performanceManager.stopMeasure("Test 5");
        });

        it(`Cleanup Of All Inserted Data and print performance statistics`, async () => {
            //TODO add PNS cleanup here
            resourceManager.cleanup();
            console.log(JSON.stringify(performanceManager.getStatistics()));
        });

    });
}

// it(`Create ADAL schema, wait for PNS, add items, set the schema to hidden=true, get resources requiring sync, and should not find the resource. get records requiring sync, and should not find the records. Get them again with IncludeDeleted = true, and should find the records and resource.`, async () => {
//     performanceManager.startMeasure("Test 6", `Create ADAL schema, wait for PNS, add items, set the schema to hidden=true, get resources requiring sync, and should not find the resource. get records requiring sync, and should not find the records. Get them again with IncludeDeleted = true, and should find the records and resource.`);
//     const tableName = "nebula_Test_Table_6" + getShortUUID();
//     // create ADAL schema
//     const test_6_schema: AddonDataScheme = {
//         "Name": tableName,
//         "Type": "data",
//         "Fields":
//         {
//             StringProperty: { Type: "String" },
//         },
//         "SyncData": {
//             "Sync": true
//         }

//     }

//     // create ADAL table
//     const test_6_table_service: ADALTableService = await resourceManager.createAdalTable(test_6_schema);
//     console.log(`created table test_6_table_service`);

//     // wait for PNS to notify nebula about the new schema
//     await nebulatestService.waitForPNS();

//     // save current time
//     const currentTimeX = new Date().toISOString();

//     // add 10 items to the table
//     const test_6_items: AddonData[] = [];
//     for (let i = 0; i < 10; i++) {
//         test_6_items.push({
//             Key: `test_6_item_${i}`,
//             StringProperty: `test_6_item_${i}`
//         });
//     }

//     await test_6_table_service.upsertBatch(test_6_items);
//     console.log(`added items to table test_6_table_service: ${JSON.stringify(test_6_items)}`);

//     // wait for PNS to notify nebula about the new items
//     await nebulatestService.waitForPNS();

//     // get nodes of test_6_table from nebula:
//     const nodes: any = await nebulatestService.getRecordsFromNebula(automationAddonUUID, tableName);
//     console.log(`nodes: ${JSON.stringify(nodes)}`);

//     // check if nebula has the records (unordered)
//     expect(nodes.length).to.equal(10);
//     for (let i = 0; i < 10; i++) {
//         expect(nodes.find(node => node.Key === `test_6_item_${i}`)).to.not.equal(undefined);
//     }

//     // set the schema to hidden=true
//     const newSchema: AddonDataScheme = {
//         "Name": tableName,
//         "Type": "data",
//         "Fields":
//         {
//             StringProperty: { Type: "String" },
//             Key: { Type: "String" }
//         },
//         "Hidden": true,
//         "SyncData": {
//             "Sync": true
//         }
//     }

//     await test_6_table_service.updateSchema(newSchema);
//     console.log(`updated schema to hidden=true`);

//     // wait for PNS to notify nebula about the new schema
//     await nebulatestService.waitForPNS();

//     // get resources requiring sync
//     const resourcesRequiringSync: any = await nebulatestService.getResourcesRequiringSync(currentTimeX);
//     console.log(`resourcesRequiringSync: ${JSON.stringify(resourcesRequiringSync)}`);

//     // check if nebula has the resource
//     expect(resourcesRequiringSync.length).to.equal(0);

//     // get records requiring sync
//     const recordsRequiringSync: any = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeX);
//     console.log(`recordsRequiringSync: ${JSON.stringify(recordsRequiringSync)}`);

//     // check if nebula has the records
//     expect(recordsRequiringSync.length).to.equal(0);

//     // get records requiring sync with IncludeDeleted = true
//     const recordsRequiringSyncWithIncludeDeleted: any = await nebulatestService.getRecordsRequiringSync(automationAddonUUID, tableName, currentTimeX, true);
//     console.log(`recordsRequiringSyncWithIncludeDeleted: ${JSON.stringify(recordsRequiringSyncWithIncludeDeleted)}`);

//     // check if nebula has the records
//     expect(recordsRequiringSyncWithIncludeDeleted.length).to.equal(10);
//     for (let i = 0; i < 10; i++) {
//         expect(recordsRequiringSyncWithIncludeDeleted.find(node => node.Key === `test_6_item_${i}`)).to.not.equal(undefined);
//     }

//     performanceManager.stopMeasure("Test 6");
// });

// it(`uninstall nebula and see that there is no exception. check to see the distributor is gone from Nebula `)




// !!!IMPORTANT COMMENT: all the resource you set or create - MUST be deleted (!); in this case: we created a user so we delete it and validate that it is
// in fact was deleted, if you set a code job - you MUST set it off, if you create a scheme you MUST delete it, etc...
