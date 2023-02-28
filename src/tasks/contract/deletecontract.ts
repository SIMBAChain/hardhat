import {
    SimbaConfig,
    deleteContractsFromPrompts,
    deleteContractFromDesignID
} from '@simbachain/web3-suites';

/**
 * delete contract from your organisation. delete from prompts if !designID
 * @param designID 
 * @returns 
 */
export const deleteContract = async (
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
