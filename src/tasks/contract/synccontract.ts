import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    syncContract,
    SimbaConfig,
} from '@simbachain/web3-suites';

const sync = async (
    hre: HardhatRuntimeEnvironment,
    designID: string,
) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    await syncContract(designID);
    SimbaConfig.log.debug(`:: EXIT :`);
}

task("sync", "pull contract from Blocks and sync in your local project")
    .setAction(async (taskArgs, hre) => {
        const {designID} = taskArgs;
        await sync(hre, designID);
    });

export default sync;