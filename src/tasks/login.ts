
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
    const previousSimbaJson = SimbaConfig.ProjectConfigStore.all;
    if (!authStore) {
        SimbaConfig.log.error(authErrors.badAuthProviderInfo);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }

    if (!interactive) {
        if (org && !app) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: if specifying an org in non-interactive mode, you must specify an app.`)}`);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        let orgData;
        let appData;
        if (!org) {
            orgData = SimbaConfig.ProjectConfigStore.get("organisation");
            const orgName = orgData.name;
            if (!orgName) {
                SimbaConfig.log.error(`${chalk.redBright(`no organisation specified in your login command, and no organisation present in your simba.json. Please login in non-interactive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
            }
        }

        if (!app) {
            appData = SimbaConfig.ProjectConfigStore.get("application");
            const appName = appData.name;
            if (!appName) {
                SimbaConfig.log.error(`${chalk.redBright(`no app specified in your login command, and no application present in your simba.json. Please login in non-interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
            }
        }

        if (!org || !app) {
            const orgFromSimbaJson = SimbaConfig.ProjectConfigStore.get("organisation");
            const orgName = orgFromSimbaJson.name;
            if (!orgName) {
                SimbaConfig.log.error(`${chalk.redBright(`no organisation specified in your login command, and no organisation present in your simba.json. Please login in non-interactive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
            }
            const appFromSimbaJson = SimbaConfig.ProjectConfigStore.get("application");
            const appName = appFromSimbaJson.name;
            if (!appName) {
                SimbaConfig.log.error(`${chalk.redBright(`no app specified in your login command, and no application present in your simba.json. Please login in non-inetractive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            } else {
                SimbaConfig.log.info(`${chalk.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
            }
        }
        authStore.logout();
        try {
            await authStore.performLogin(interactive);
            if (org) {
                orgData = await chooseOrganisationFromName(simbaConfig, org);
            }
            if (app) {
                appData = await chooseApplicationFromName(simbaConfig, app);
            }
            if (orgData.id != appData.organisation.id) {
                SimbaConfig.log.error(`${chalk.redBright(`the selected app is not part of the selected organisation. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`)}`);
                return;
            }

            SimbaConfig.resetSimbaJson(previousSimbaJson, org);
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
        SimbaConfig.resetSimbaJson(previousSimbaJson, org);
        SimbaConfig.organisation = org
        SimbaConfig.application = app
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

export default login;
