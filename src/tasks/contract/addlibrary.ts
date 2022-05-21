import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    SimbaConfig,
    addLib,
} from '@simbachain/web3-suites';

/**
 * add an external library to your project
 * @param libName 
 * @param libAddress 
 * @returns 
 */
const addLibrary = async (
    hre: HardhatRuntimeEnvironment,
    libName?: string,
    libAddress?: string,
) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    await addLib(libName, libAddress);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}

task("addlib", "add a library name and address for contracts that depend on that library")
    .setAction(async (taskArgs, hre) => {
        const {name, addr} = taskArgs;
        await addLibrary(hre, name, addr);
    });

export default addLibrary;