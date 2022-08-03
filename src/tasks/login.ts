
import {
    task,
} from "hardhat/config";
import {
    HardhatRuntimeEnvironment,
} from "hardhat/types";
import {
    chooseApplicationFromList,
    chooseOrganisationFromList,
    chooseApplicationFromName,
    chooseOrganisationFromName,
    SimbaConfig,
    authErrors,
} from '@simbachain/web3-suites';
import axios from "axios";
import {default as chalk} from 'chalk';
import { AzureHandler, KeycloakHandler } from "@simbachain/web3-suites/dist/commands/lib/authentication";

/**
 * obtain auth token and choose organisation and application to log into
 * @param hre 
 * @returns 
 */
const login = async (
    hre: HardhatRuntimeEnvironment,
    interactive: boolean = true,
    org?: string,
    app?: string,
    ): Promise<void | Error> => {
    SimbaConfig.log.debug(`:: ENTER : interactive: ${interactive}, org: ${org}, app: ${app}`);
    const simbaConfig = new SimbaConfig();
    const authStore = await simbaConfig.authStore();

    if (!authStore) {
        SimbaConfig.log.error(authErrors.badAuthProviderInfo);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }

    if (!interactive && (!org || !app)) {
        const message = "\nsimba: if logging in with --interactive false, then you must specify an org and app using --org <org> --app <app> syntax";
        SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
        return Promise.resolve(new Error(`${message}`));
    }

    if (authStore instanceof KeycloakHandler) {
        try {
            // logging out by default when we run login
            await authStore.logout();
            // we don't have to run a login command with KeycloakHandler
            // because login functionality is embedded in doGetRequest
            const org = await chooseOrganisationFromList(simbaConfig);
            if (!org) {
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await chooseApplicationFromList(simbaConfig);
            if (!app) {
                SimbaConfig.log.debug(`:: ENTER :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
    }

    if (authStore instanceof AzureHandler) {
        if (!interactive) {
            if (!org || !app) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : org and app must both be specified when using non-interactive mode.`)}`);
                return;
            }
            authStore.logout();
            try {
                await authStore.performLogin(interactive, org, app);
                await chooseOrganisationFromName(simbaConfig, org);
                await chooseApplicationFromName(simbaConfig, app);
                SimbaConfig.log.info(`${chalk.greenBright(`Logged in to SIMBA Chain!`)}`);
                SimbaConfig.log.debug(`:: EXIT :`);
                return;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                }
                return;
            }
        }
        try {
            authStore.logout();
            if (!authStore.isLoggedIn()) {
                await authStore.performLogin();
            } else {
                try {
                    await authStore.refreshToken();
                } catch (e) {
                    await authStore.performLogin();
                }
            }
            const org = await chooseOrganisationFromList(simbaConfig);
            if (!org) {
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve(new Error('No Organisation Selected!'));
            }
            const app = await chooseApplicationFromList(simbaConfig);
            if (!app) {
                SimbaConfig.log.debug(`:: ENTER :`);
                return Promise.resolve(new Error('No Application Selected!'));
            }
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Logged in with organisation')} ${chalk.greenBright(org.display_name)} ${chalk.cyanBright('and application')} ${chalk.greenBright(app.display_name)}`);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
    }
}

task("login", "keycloak device and blocks login")
    .setAction(async (hre) => {
        await login(hre);
    });

export default login;