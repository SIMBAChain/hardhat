import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    printAllContracts,
    SimbaConfig,
} from '@simbachain/web3-suites';

/**
 * print name, version, and design_id for all contracts in your simbachain.com org
 * @param hre 
 */
const viewContracts = async (hre: HardhatRuntimeEnvironment) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    await printAllContracts();
    SimbaConfig.log.debug(`:: EXIT :`);
}

task("viewcontracts", "view info for all contracts in your organisation")
    .setAction(async (hre) => {
        await viewContracts(hre);
    });

export default viewContracts;