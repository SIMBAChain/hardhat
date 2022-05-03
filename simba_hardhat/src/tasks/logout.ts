import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    log,
    SimbaConfig,
} from "./lib";

const logout = async (hre: HardhatRuntimeEnvironment) => {
    log.debug(`:: ENTER :`);
    await SimbaConfig.authStore.logout();
    log.debug(`:: EXIT :`);
}

task("logout", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await logout(hre);
    });

export default logout;