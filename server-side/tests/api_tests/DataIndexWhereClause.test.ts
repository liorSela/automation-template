import { expect } from 'chai';
import { Connector, validateOrderOfResponseBySpecificField } from './services/DataIndexWhereClause.service';
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
        testerFunc(it, expect, connector);
    });

    describe('Shared-Index Tests:', async () => {
        let connector = service.indexType("shared");
        testerFunc(it, expect, connector);
    });
}

function testerFunc(it: any, expect, connector: Connector) {
    it(`Index Creation`, async () => {
        await connector.upsertSchema({
            "Fields": {
                "string_field": {
                    "Type": "String",
                    "Indexed": true
                },
                "bool_field": {
                    "Type": "Bool",
                    "Indexed": true
                },
                "int_field": {
                    "Type": "Integer",
                    "Indexed": true
                },
                "double_field": {
                    "Type": "Double",
                    "Indexed": true
                },
                "date_field": {
                    "Type": "DateTime",
                    "Indexed": true
                },
                "unindexed_field": {
                    "Type": "String",
                    "Indexed": false
                }
            }
        });
    });

    it(`Create Documents`, async () => {
        await connector.batchUpsertDocuments([
            {
                Key: "1",
                string_field: "Susann Renato",
                bool_field: true,
                int_field: 6,
                double_field: 9.5,
                date_field: "2022-11-24T12:43:32.166Z",
                unindexed_field: "shouldn't be indexed"
            },
            {
                Key: "2",
                string_field: "Jessika Renato",
                bool_field: false,
                int_field: 4,
                double_field: 6.2,
                date_field: "2022-11-24T12:45:32.166Z",
                unindexed_field: "shouldn't be indexed"
            },
            {
                Key: "3",
                string_field: "Jessika Silvano",
                bool_field: true,
                int_field: 2,
                double_field: 1.5,
                date_field: "2022-11-24T12:47:32.166Z",
                unindexed_field: "shouldn't be indexed"
            },
            {
                Key: "4",
                string_field: "Shani Silvano",
                bool_field: false,
                int_field: 1,
                double_field: 2.3,
                date_field: "2022-11-24T12:46:32.166Z",
                unindexed_field: "shouldn't be indexed"
            },
            {
                Key: "5",
                string_field: "Susann Kimbell",
                bool_field: true,
                int_field: 3,
                double_field: 8.4,
                date_field: "2022-11-24T12:44:32.166Z",
                unindexed_field: "shouldn't be indexed"
            },
            {
                Key: "6",
                string_field: "Shani Kimbell",
                bool_field: false,
                int_field: 5,
                double_field: 10.0,
                date_field: "2022-11-24T12:42:32.166Z",
                unindexed_field: "shouldn't be indexed"
            }
        ]);
    })

    it("Get all documents ordered by Key", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "Key"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "Key");
    })

    it("Get all documents ordered by string_field", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "string_field"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "string_field");
    })

    it("Get all documents ordered by bool_field", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "bool_field"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "bool_field", true);
    })

    it("Get all documents ordered by int_field", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "int_field"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "int_field");
    })

    it("Get all documents ordered by double_field", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "double_field"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "double_field");
    })

    it("Get all documents ordered by date_field", async () => {
        let diResponse = await connector.getDocuments({
            order_by: "date_field"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(6);
        validateOrderOfResponseBySpecificField(diResponse, "date_field");
    })

    it("Get all documents that string_field starts with \"Susann\"", async () => {
        let diResponse = await connector.getDocuments({
            where: "string_field like 'Susann%'"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(2);
    })

    it("Get all documents that string_field end with \"Kimbell\"", async () => {
        let diResponse = await connector.getDocuments({
            where: "string_field like '%Kimbell'"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(2);
    })

    it("Get all documents that string_field doesn't end with \"Kimbell\" (using not)", async () => {
        let diResponse = await connector.getDocuments({
            where: "string_field not like '%Kimbell'"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(4);
    })

    it("Get all documents that int_field is greater then 4", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field > 4"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(2);
    })

    it("Get all documents that int_field is lesser then 4", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field < 4"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(3);
    })

    it("Get all documents that int_field is in range", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field >= 2 and int_field <= 5"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(4);
    })

    it("Get all documents that int_field out of range (using or)", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field < 2 or int_field > 5"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(2);
    })

    // it("Get all documents that int_field not equal 4 (using not and equal)", async () => {
    //     let diResponse = await connector.getDocuments({
    //         where: "not int_field = 4"
    //     });
    //     expect(diResponse, "Response array").to.be.an('array').with.lengthOf(5);
    // })

    it("Get all documents that int_field not equal 4 (using !=)", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field != 4"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(5);
    })

    // it("Get all documents that int_field out of range (using nand)", async () => {
    //     let diResponse = await connector.getDocuments({
    //         where: "not (int_field >= 2 and int_field <= 5)"
    //     });
    //     expect(diResponse, "Response array").to.be.an('array').with.lengthOf(2);
    // })

    it("Get all documents that int_field not in list (using not in)", async () => {
        let diResponse = await connector.getDocuments({
            where: "int_field not in (1,3,5)"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(3);
    })

    it("Get all documents that string_field not in list (using not in)", async () => {
        let diResponse = await connector.getDocuments({
            where: "string_field not in ('Susann Renato', 'Jessika Silvano')"
        });
        expect(diResponse, "Response array").to.be.an('array').with.lengthOf(4);
    })

    it(`Index Purge`, async () => {
        await connector.purgeSchema();
    });
}
