//04de9428-8658-4bf7-8171-b59f6327bbf1
import {
    FindOptions,
    PapiClient,
    User,
} from '@pepperi-addons/papi-sdk';
import GeneralService from '../../../../potentialQA_SDK/server_side/general.service';

export class ObjectUsersService {
    papiClient: PapiClient;
    generalService: GeneralService;

    constructor(public service: GeneralService) {
        this.papiClient = service.papiClient;
        this.generalService = service;
    }

    getUsers(options?: FindOptions): Promise<User[]> {
        return this.papiClient.users.find(options);
    }

    createUser(body: User): Promise<User> {
        return this.papiClient.post('/CreateUser', body);
    }

    updateUser(body: User): Promise<User> {
        return this.papiClient.users.upsert(body);
    }

    async getRepProfile() {
        const profiles = await this.papiClient.get('/profiles');
        for (const i in profiles) {
            if (profiles[i].Name == 'Rep') {
                return profiles[i];
            }
        }
    }

    async getSecurityGroup(idpBaseURL: string) {
        const securityGroups = await this.generalService
            .fetchStatus(idpBaseURL + '/api/securitygroups', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.papiClient['options'].token,
                },
            })
            .then((res) => res.Body);
        return securityGroups;
    }

    getSingleUser(type, ID) {
        switch (type) {
            case 'UUID':
                return this.papiClient.get('/users/uuid/' + ID);
            case 'ExternalID':
                return this.papiClient.get('/users/externalid/' + ID);
            case 'InternalID':
                return this.papiClient.get('/users/' + ID);
        }
    }

    deleteUser(type, ID) {
        switch (type) {
            case 'UUID':
                return this.papiClient
                    .delete('/users/uuid/' + ID)
                    .then((res) => res.text())
                    .then((res) => (res ? JSON.parse(res) : ''));
            case 'ExternalID':
                return this.papiClient
                    .delete('/users/externalid/' + ID)
                    .then((res) => res.text())
                    .then((res) => (res ? JSON.parse(res) : ''));
            case 'InternalID':
                return this.papiClient
                    .delete('/users/' + ID)
                    .then((res) => res.text())
                    .then((res) => (res ? JSON.parse(res) : ''));
        }
    }
}
