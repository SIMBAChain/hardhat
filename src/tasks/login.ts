
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
 * command for user to login (acquire auth token, and choose org and app from blocks)
 * @param interactive - if true, then choose org and app from prompts
 * Also, if true, auth token will be generated through device login flow
 * If false, auth token will be generated through client creds flow,
 * so SIMBA_AUTH_CLIENT_ID and SIMBA_AUTH_CLIENT_SECRET need to be present
 * in .simbachain.env, simbachain.env, or .env in project root or SIMBA_HOME
 * @param org - if !interactive, org must be specified, or be present in simba.json
 * @param app - if !interactive, app must be specified or be present in simba.json
 * @returns 
 */
export const login = async (
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
            const message = `\nsimba: if specifying an org in non-interactive mode, you must specify an app.`;
            SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
            throw new Error(message);
        }
        let orgData;
        let appData;

        if (!org || !app) {
            const orgFromSimbaJson = SimbaConfig.ProjectConfigStore.get("organisation");
            try {
                const orgName = orgFromSimbaJson.name;
                SimbaConfig.log.info(`${chalk.cyanBright(`no org was specified in login command; logging in using org ${orgName} from simba.json`)}`);
            } catch (error) {
                const message = `no organisation specified in your login command, and no organisation present in your simba.json. Please login in interactive mode and choose your organisation, or use the --org <org> flag in your non-interactive login command.`;
                SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
                throw new Error(message);
            }
            const appFromSimbaJson = SimbaConfig.ProjectConfigStore.get("application");
            try {
                const appName = appFromSimbaJson.name;
                SimbaConfig.log.info(`${chalk.cyanBright(`no app was specified in login command; logging in using app ${appName} from simba.json`)}`);
            } catch (error) {
                const message = `no app specified in your login command, and no application present in your simba.json. Please login in interactive mode and choose your application, or use the --app <app> flag in your non-interactive login command.`;
                SimbaConfig.log.error(`${chalk.redBright(`${message}`)}`);
                throw new Error(message);
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

