import { User } from "@pepperi-addons/papi-sdk";
import GeneralService, { TesterFunctions } from "../../potentialQA_SDK/server_side/general.service";
import { ObjectsService } from "./services/example.objects.service";

export async function TemplateTests(generalService: GeneralService, request, tester: TesterFunctions) {
    //setting 'mocha verbs' to use
    const describe = tester.describe;
    const expect = tester.expect;
    const it = tester.it;

    //#region Upgrade Relevant Addons For Test -- here we are describing the relevant addons which have to be installed on certain version to run the test
    const testData = {
        'AddonNumber1Name': ['AddonNumber1UUID', ''], //sending no version will result in getting the LATEST avalibale phased version
        'AddonNumber2Name': ['AddonNumber2UUID', 'Addon2Version'], //sending specific version will result in searching this version as published 
    };
    //saving relevant var key based on the env which we run on
    let varKey;
    if (generalService.papiClient['options'].baseURL.includes('staging')) {
        varKey = request.body.varKeyStage;
    } else {
        varKey = request.body.varKeyPro;
    }
    //installing the descirbed addons -- passing 'false' will result in searching all versions, 'true' will result in searhing phased versions only - this may collide with 'testData' 
    const chnageVersionResponseArr = await generalService.changeVersion(varKey, testData, false); 
    const isInstalledArr = await generalService.areAddonsInstalled(testData); //testing all addons installed on 'asked' version
    //#endregion Upgrade Relevant Addons For Test

    describe('Template Tests Suites', () => {//the string inside the desribes will effect the report - name should be changed
        describe('Prerequisites Addon for Template Tests', () => { //done to validate addons which failed to install failed on 'is already working on version'
                /**
                 * THIS SHOULD BE LEFT AS IS
                 */
            isInstalledArr.forEach((isInstalled, index) => {
                it(`Validate That Needed Addon Is Installed: ${Object.keys(testData)[index]}`, () => {
                    expect(isInstalled).to.be.true;
                });
            });

            for (const addonName in testData) {
                const addonUUID = testData[addonName][0];
                const version = testData[addonName][1];
                const varLatestVersion = chnageVersionResponseArr[addonName][2];
                const changeType = chnageVersionResponseArr[addonName][3];
                describe(`Test Data: ${addonName}`, () => {
                    it(`${changeType} To Latest Version That Start With: ${version ? version : 'any'}`, () => {
                        if (chnageVersionResponseArr[addonName][4] == 'Failure') {
                            expect(chnageVersionResponseArr[addonName][5]).to.include('is already working on version');
                        } else {
                            expect(chnageVersionResponseArr[addonName][4]).to.include('Success');
                        }
                    });

                    it(`Latest Version Is Installed ${varLatestVersion}`, async () => {
                        await expect(generalService.papiClient.addons.installedAddons.addonUUID(`${addonUUID}`).get())
                            .eventually.to.have.property('Version')
                            .a('string')
                            .that.is.equal(varLatestVersion);
                    });
                });
            }
        });
        describe('Test Suit Example', () => {
            const service = new ObjectsService(generalService);
            it('Basic Test Example #1: Using Objects Service To Validate All Users Data Entrys Are Valid', async () => {
                // This Is An Example Of How To Write Tests - Using Example Service From Automation Infra - Objects
                /**
                 * your code should replace this
                 */
                const initialUsersList: User[] = await service.getUsers();
                expect(initialUsersList).to.be.an('array').with.lengthOf.above(0);
                for (let index = 0; index < initialUsersList.length; index++) {
                    expect(initialUsersList[index], 'InternalID Testing').to.have.property('InternalID').that.is.a('number').and.is.above(0);
                    expect(initialUsersList[index], 'UUID Testing').to.have.property('UUID').that.is.a('string').and.is.not.empty;
                    expect(initialUsersList[index], 'ExternalID Testing').to.have.property('ExternalID').that.is.a('string');
                    expect(initialUsersList[index], 'Email Testing').to.have.property('Email').that.is.a('string').and.is.not.empty;
                    expect(initialUsersList[index], 'FirstName Testing').to.have.property('FirstName').that.is.a('string');
                    expect(initialUsersList[index], 'LastName Testing').to.have.property('LastName').that.is.a('string');
                    expect(initialUsersList[index], 'Hidden Testing').to.have.property('Hidden').that.is.a('boolean').and.is.false;
                    expect(initialUsersList[index], 'IsInTradeShowMode Testing').to.have.property('IsInTradeShowMode').that.is.a('boolean');
                    expect(initialUsersList[index], 'Mobile Testing').to.have.property('Mobile').that.is.a('string');
                    expect(initialUsersList[index], 'CreationDateTime Testing').to.have.property('CreationDateTime').that.contains('Z');
                    expect(initialUsersList[index], 'ModificationDateTime Testing').to.have.property('ModificationDateTime').that.contains('Z');
                    expect(initialUsersList[index], 'Phone Testing').to.have.property('Phone').that.is.a('string');
                    expect(initialUsersList[index], 'Profile Testing').to.have.property('Profile').that.is.an('object');
                    expect(initialUsersList[index], 'Role Testing').to.have.property('Role');
                }
            });
            it('Basic Test Example #2: Using Objects Service To Validate Users API Options Functionality', async () => {
                /**
                * your code should replace this
                */
                const optionalUsersFieldList: User[] = await service.getUsers({
                    fields: [
                        'Name',
                        'EmployeeType',
                        'IsSupportAdminUser',
                        'IsUnderMyRole',
                        'SecurityGroupUUID',
                        'SecurityGroupName',
                    ],
                });
                expect(optionalUsersFieldList).to.be.an('array').with.lengthOf.above(0);
                for (let index = 0; index < optionalUsersFieldList.length; index++) {
                    expect(optionalUsersFieldList[index], 'Name Property Testing').to.have.property('Name').that.is.a('string').and.is.not.empty;
                    expect(optionalUsersFieldList[index], 'EmployeeType Array Property Testing').to.have.property('EmployeeType').that.is.a('number').and.is.above(0);
                    expect(optionalUsersFieldList[index], 'IsSupportAdminUser Property Tessting').to.have.property('IsSupportAdminUser').that.is.a('boolean');
                    expect(optionalUsersFieldList[index], 'IsUnderMyRole Property Tessting').to.have.property('IsUnderMyRole').that.is.a('boolean');
                    expect(optionalUsersFieldList[index], 'SecurityGroupUUID Property Tessting').to.have.property('SecurityGroupUUID').that.is.a('string').and.is.not.empty;
                    expect(optionalUsersFieldList[index], 'SecurityGroupName Property Tessting').to.have.property('SecurityGroupName').that.is.a('string').and.is.not.empty;
                }
            });
        });
    });
}
