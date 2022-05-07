import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    log,
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

const logout = async (hre: HardhatRuntimeEnvironment) => {
    log.debug(`:: ENTER :`);
    await SimbaConfig.authStore.logout();
    log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    log.debug(`:: EXIT :`);
}

task("logout", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await logout(hre);
    });

export default logout;