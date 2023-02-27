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
export const addLibrary = async (
    libName?: string,
    libAddress?: string,
) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    await addLib(libName, libAddress);
    SimbaConfig.log.debug(`:: EXIT :`);
    return;
}
