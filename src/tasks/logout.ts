import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

/**
 * deletes auth token from configstore (authconfig.json)
 * @param hre 
 */
const logout = async (hre: HardhatRuntimeEnvironment) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    const authStore = await SimbaConfig.authStore();
    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`)
    }
    await authStore.logout();
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    SimbaConfig.log.debug(`:: EXIT :`);
}

task("logout", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await logout(hre);
    });

export default logout;