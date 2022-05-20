
import {
    task,
} from "hardhat/config";
import {
    HardhatRuntimeEnvironment,
} from "hardhat/types";
import {
    chooseApplicationFromList,
    chooseOrganisationFromList,
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

/**
 * obtain auth token and choose organisation and application to log into
 * @param hre 
 * @returns 
 */
const login = async (hre: HardhatRuntimeEnvironment): Promise<void | Error> => {
    SimbaConfig.log.debug(`:: ENTER :`);
    const simbaConfig = new SimbaConfig();
    // logging out by default when we run login
    await simbaConfig.authStore.logout();
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
}

task("login", "keycloak device and blocks login")
    .setAction(async (hre) => {
        await login(hre);
    });

export default login;