import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {default as chalk} from 'chalk';
import {
    SimbaConfig,
    deleteContractFromDesignID,
    deleteContractsFromPrompts,
} from '@simbachain/web3-suites';

const deleteContract = async (
    designID?: string,
) => {
    SimbaConfig.log.debug(`:: ENTER : designID : ${designID}`);
    if (!designID) {
        await deleteContractsFromPrompts();
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    await deleteContractFromDesignID(designID);
    SimbaConfig.log.debug(`:: EXIT :`);
}

export default deleteContract;