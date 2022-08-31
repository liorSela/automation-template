//10979a11-d7f4-41df-8993-f06bfd778304
import { ActivityDataIndexService } from './services/ActivityDataIndex.service';
import GeneralService, { TesterFunctions } from '../../../potentialQA_SDK/server_side/general.service';

export async function ActivityDataIndex(generalService: GeneralService, request, tester: TesterFunctions) {
    const dataIndexService = new ActivityDataIndexService(generalService);



    const describe = tester.describe;
    const expect = tester.expect;
    const it = tester.it;


    const uiDataObject = {
        all_activities_fields: [
            { fieldID: 'ExternalID', type: 'String' },
            { fieldID: 'TaxPercentage', type: 'Double' },
            { fieldID: 'Remark', type: 'String' },
            { fieldID: 'CreationDateTime', type: 'DateTime' },
            { fieldID: 'SubTotal', type: 'Double' },
            { fieldID: 'Status', type: 'Integer' },
            { fieldID: 'DiscountPercentage', type: 'Double' },
            { fieldID: 'Account.ExternalID', type: 'String' },
            { fieldID: 'Account.City', type: 'String' },
            { fieldID: 'Account.Country', type: 'String' },
            { fieldID: 'Account.Status', type: 'Integer' },
            { fieldID: 'Account.Parent.City', type: 'String' },
            { fieldID: 'Catalog.Description', type: 'String' },
            { fieldID: 'Catalog.ExternalID', type: 'String' },
            { fieldID: 'ContactPerson.ExternalID', type: 'String' },
            { fieldID: 'ContactPerson.FirstName', type: 'String' },
            { fieldID: 'ContactPerson.Mobile', type: 'String' },
            { fieldID: 'Creator.ExternalID', type: 'String' },
            { fieldID: 'Creator.FirstName', type: 'String' },
            { fieldID: 'Creator.Mobile', type: 'String' },
            { fieldID: 'Agent.ExternalID', type: 'String' },
            { fieldID: 'Agent.FirstName', type: 'String' },
            { fieldID: 'Agent.Mobile', type: 'String' },
            { fieldID: 'OriginAccount.ExternalID', type: 'String' },
            { fieldID: 'OriginAccount.City', type: 'String' },
            { fieldID: 'OriginAccount.Status', type: 'Integer' },
            { fieldID: 'AdditionalAccount.ExternalID', type: 'String' },
            { fieldID: 'AdditionalAccount.City', type: 'String' },
            { fieldID: 'AdditionalAccount.Status', type: 'Integer' },
        ],
        transaction_lines_fields: [
            { fieldID: 'LineNumber', type: 'Integer' },
            { fieldID: 'DeliveryDate', type: 'DateTime' },
            { fieldID: 'TotalUnitsPriceAfterDiscount', type: 'Double' },
            { fieldID: 'TotalUnitsPriceBeforeDiscount', type: 'Double' },
            { fieldID: 'Item.ExternalID', type: 'String' },
            { fieldID: 'Item.Name', type: 'String' },
            { fieldID: 'UnitDiscountPercentage', type: 'Double' },
            { fieldID: 'CreationDateTime', type: 'DateTime' },
            { fieldID: 'Transaction.ExternalID', type: 'String' },
            { fieldID: 'Transaction.InternalID', type: 'Integer' },
            { fieldID: 'Transaction.Remark', type: 'String' },
            { fieldID: 'Transaction.CreationDateTime', type: 'DateTime' },
            { fieldID: 'Transaction.SubTotal', type: 'Double' },
            { fieldID: 'Transaction.Status', type: 'Integer' },
            { fieldID: 'Transaction.DiscountPercentage', type: 'Double' },
            { fieldID: 'Transaction.Account.ExternalID', type: 'String' },
            { fieldID: 'Transaction.Account.ZipCode', type: 'String' },
            { fieldID: 'Transaction.Account.Status', type: 'Integer' },
            { fieldID: 'Transaction.Account.City', type: 'String' },
            { fieldID: 'Transaction.Account.Parent.City', type: 'String' },
            { fieldID: 'Transaction.Agent.ExternalID', type: 'String' },
            { fieldID: 'Transaction.Agent.FirstName', type: 'String' },
            { fieldID: 'Transaction.Agent.Mobile', type: 'String' },
            { fieldID: 'Transaction.ContactPerson.ExternalID', type: 'String' },
            { fieldID: 'Transaction.ContactPerson.FirstName', type: 'String' },
            { fieldID: 'Transaction.ContactPerson.Mobile', type: 'String' },
            { fieldID: 'Transaction.OriginAccount.ExternalID', type: 'String' },
            { fieldID: 'Transaction.OriginAccount.City', type: 'String' },
            { fieldID: 'Transaction.OriginAccount.Status', type: 'Integer' },
            { fieldID: 'Transaction.AdditionalAccount.ExternalID', type: 'String' },
            { fieldID: 'Transaction.AdditionalAccount.City', type: 'String' },
            { fieldID: 'Transaction.AdditionalAccount.Status', type: 'Integer' },
        ],
    };

    const all_activities_fields_to_test_response = [
        'ExternalID',
        'TaxPercentage',
        'Remark',
        'CreationDateTime',
        'SubTotal',
        'Status',
        'DiscountPercentage',
        'Account.ExternalID',
        'Account.City',
        'Account.Country',
        'Account.Status',
        'Account.Parent.City',
        'Catalog.Description',
        'Catalog.ExternalID',
        'ContactPerson.ExternalID',
        'ContactPerson.FirstName',
        'ContactPerson.Mobile',
        'Creator.ExternalID',
        'Creator.FirstName',
        'Creator.Mobile',
        'Agent.ExternalID',
        'Agent.FirstName',
        'Agent.Mobile',
        'OriginAccount.ExternalID',
        'OriginAccount.City',
        'OriginAccount.Status',
        'AdditionalAccount.ExternalID',
        'AdditionalAccount.City',
        'AdditionalAccount.Status',
    ];

    const transaction_lines_fields_to_test_response = [
        'LineNumber',
        'DeliveryDate',
        'TotalUnitsPriceAfterDiscount',
        'TotalUnitsPriceBeforeDiscount',
        'Item.ExternalID',
        'Item.Name',
        'UnitDiscountPercentage',
        'CreationDateTime',
        'Transaction.ExternalID',
        'Transaction.InternalID',
        'Transaction.Remark',
        'Transaction.CreationDateTime',
        'Transaction.SubTotal',
        'Transaction.Status',
        'Transaction.DiscountPercentage',
        'Transaction.Account.ExternalID',
        'Transaction.Account.ZipCode',
        'Transaction.Account.Status',
        'Transaction.Account.City',
        'Transaction.Account.Parent.City',
        'Transaction.Agent.ExternalID',
        'Transaction.Agent.FirstName',
        'Transaction.Agent.Mobile',
        'Transaction.ContactPerson.ExternalID',
        'Transaction.ContactPerson.FirstName',
        'Transaction.ContactPerson.Mobile',
        'Transaction.OriginAccount.ExternalID',
        'Transaction.OriginAccount.City',
        'Transaction.OriginAccount.Status',
        'Transaction.AdditionalAccount.ExternalID',
        'Transaction.AdditionalAccount.City',
        'Transaction.AdditionalAccount.Status',
    ];


    describe('Data Index Tests Suites', () => {
        describe('Export', () => {
            it('Clean Data Index', async () => {
                const auditLogCreate = await dataIndexService.cleanDataIndex();
                expect(auditLogCreate).to.have.property('URI');

                const auditLogResponse = await generalService.getAuditLogResultObjectIfValid(auditLogCreate.URI, 40);
                expect(auditLogResponse.Status?.ID).to.be.equal(1);

                const exportResponse = JSON.parse(auditLogResponse.AuditInfo.ResultObject);
                expect(exportResponse.success).to.be.true;
            });

            it('Post Fields To Export', async () => {
                const auditLogCreate = await dataIndexService.exportDataToDataIndex(uiDataObject);
                expect(auditLogCreate).to.have.property('URI');

                const auditLogResponse = await generalService.getAuditLogResultObjectIfValid(auditLogCreate.URI, 40);
                expect(auditLogResponse.Status?.ID).to.be.equal(1);

                const postFieldsResponse = await JSON.parse(auditLogResponse.AuditInfo.ResultObject);
                expect(postFieldsResponse.CreationDateTime).to.include('Z');
                expect(postFieldsResponse.ModificationDateTime).to.include(new Date().toISOString().split('T')[0]);
                expect(postFieldsResponse.ModificationDateTime).to.include('Z');
                expect(postFieldsResponse.Hidden).to.be.false;
                expect(postFieldsResponse.Key).to.be.equal('meta_data');
                expect(postFieldsResponse.RunTime).to.be.null;
                expect(postFieldsResponse.all_activities_fields).to.include.members(
                    all_activities_fields_to_test_response,
                );
                expect(postFieldsResponse.transaction_lines_fields).to.include.members(
                    transaction_lines_fields_to_test_response,
                );
            });
        });
    });
}
