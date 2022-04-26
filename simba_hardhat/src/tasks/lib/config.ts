/*
NOTE:
this file will actually come from the standalone web3 repo
it is just included here for now for testing purposes
*/

import {
    Logger,
} from "tslog";
const log: Logger = new Logger();
import {cwd} from 'process';
import * as path from 'path';
import Configstore from 'configstore';
import {KeycloakHandler} from './authentication';

export class SimbaConfig {
    public static _web3Suite: string;
    // Common config, such as auth
    public static _configStore: Configstore;
    // Project config, such as app ID, etc
    public static _projectConfigStore: Configstore;
    public static help = false;
    public static _authStore: KeycloakHandler;
    public static _application: any;
    public static _organisation: any;

    public constructor() {
        // SimbaConfig._configStore = new Configstore(`@simbachain/${this.web3Suite}`);
        // SimbaConfig._projectConfigStore = new Configstore(`@simbachain/${this.web3Suite}`, null, {
        //     configPath: path.join(cwd(), 'simba.json'),
        // });
        // this.application = this.Application;
        // this.organisation = this.getOrganisation();
        // this.authStore = this.getAuthStore();
        const confstore = SimbaConfig.ConfigStore;
        const projconfstore = SimbaConfig.ProjectConfigStore;
        const app = SimbaConfig.application;
        const org = SimbaConfig.organisation;
        const authStr = SimbaConfig.authStore;
        const suite = SimbaConfig.web3Suite;
        const constructorParams = {
            confstore,
            projconfstore,
            app,
            org,
            authStr,
            suite,
        }
        log.debug(`:: ENTER : SimbaConfig constructor params : ${JSON.stringify(constructorParams)}`)

    }

    public static get ConfigStore(): Configstore {
        if (!this._configStore) {
            this._configStore = new Configstore(`@simbachain/${this.web3Suite}`);
        }
        return this._configStore;
    }

    public get ConfigStore(): Configstore {
        return SimbaConfig.ConfigStore;
    }

    public static get ProjectConfigStore(): Configstore {
        if (!this._projectConfigStore) {
            this._projectConfigStore = new Configstore(`@simbachain/${this.web3Suite}`, null, {
                configPath: path.join(cwd(), 'simba.json'),
            });
        }
        return this._projectConfigStore;
    }

    public get ProjectConfigStore(): Configstore {
        return SimbaConfig.ConfigStore;
    }

    public static get authStore(): KeycloakHandler {
        log.debug(`:: ENTER :`)
        if (!this._authStore) {
            this._authStore = new KeycloakHandler(this._configStore, this._projectConfigStore);
        }
        log.debug(`:: EXIT :`);
        return this._authStore;
    }

    public get authStore(): KeycloakHandler {
        return SimbaConfig.authStore;
    }

    public static get web3Suite(): string {
        return this._projectConfigStore.get('web3Suite');
    }

    public get web3Suite(): string {
        return SimbaConfig.web3Suite;
    }

    public static set web3Suite(_web3Suite: string) {
        this._projectConfigStore.set('web3Suite', _web3Suite);
    }
    
    public set web3Suite(_web3Suite: string) {
        SimbaConfig.web3Suite = _web3Suite;
    }

    public static get organisation(): any {
        const org = this.ProjectConfigStore.get('organisation') ? this.ProjectConfigStore.get('organisation') : this.ProjectConfigStore.get('organization');
        return org;
    }

    public get organisation(): any {
        return SimbaConfig.organisation;
    }

    public static set organisation(org: any) {
        this.ProjectConfigStore.set('organisation', org);
    }

    public set organisation(org: any) {
        SimbaConfig.organisation = org;
    }

    public static get application(): any {
        return this.ProjectConfigStore.get('application');
    }

    public get application(): any {
        return SimbaConfig.application;
    }

    public static set application(app: any) {
        this.ProjectConfigStore.set('application', app);
    }

    public set application(app: any) {
        SimbaConfig.application = app;
    }
}