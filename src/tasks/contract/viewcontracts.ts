import {
    printAllContracts,
    SimbaConfig,
} from '@simbachain/web3-suites';

const viewContracts = async () => {
    SimbaConfig.log.debug(`:: ENTER :`);
    await printAllContracts();
    SimbaConfig.log.debug(`:: EXIT :`);
}

export default viewContracts;