import {default as chalk} from 'chalk';
import {
    pullAllMostRecentSolFilesAndSourceCode,
    pullMostRecentRecentSolFileFromContractName,
    pullMostRecentSourceCodeFromContractName,
    pullMostRecentFromContractName,
    pullContractFromDesignId,
    SimbaConfig,
    pullSourceCodeForSimbaJson,
} from '@simbachain/web3-suites';

/**
 * when pulling your contracts from your blocks organisation, you can "pull" them
 * into two locations: your local contracts folder (or contracts/simbaimports), and/or
 * your simba.json
 * 
 * pulling makes sure that, when working with teams, everyone is working
 * with the most recent versions of contracts that have been exported to blocks
 * @param designID 
 * @param contractName 
 * @param pullSourceCode - pull source code to your simba.json
 * @param pullSolFiles - pull .sol files to your contracts or contracts/simbaimports directory
 * @param interactive 
 * @param useSimbaPath - pull to contracts/simbaimports
 * @returns 
 */
const pull = async (
    designID?: string,
    contractName?: string,
    pullSourceCode: boolean = true,
    pullSolFiles: boolean = false,
    interactive: boolean = false,
    useSimbaPath: boolean = true,
) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    if (designID && contractName) {
        const message = `${chalk.redBright(`\nsimba: designid and contractname were both specified. Only one of these parameters can be passed.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (designID && interactive) {
        const message = `${chalk.redBright(`\nsimba: designid cannot be specified in interactive mode.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (contractName && interactive) {
        const message = `${chalk.redBright(`\nsimba: contractname cannot be specified in interactive mode.`)}`;
        SimbaConfig.log.error(message);
        return;
    }
    if (designID) {
        const contractDesign = await pullContractFromDesignId(designID, useSimbaPath);
        if (pullSourceCode && contractDesign) {
            pullSourceCodeForSimbaJson(contractDesign)
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contractName) {
        if (pullSolFiles && pullSourceCode) {
            await pullMostRecentFromContractName(contractName, undefined, useSimbaPath);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSolFiles) {
            await pullMostRecentRecentSolFileFromContractName(contractName, undefined, useSimbaPath);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        if (pullSourceCode) {
            await pullMostRecentSourceCodeFromContractName(contractName);
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        // default to pulling sol files and source code for simba.json
        await pullMostRecentFromContractName(contractName, undefined, useSimbaPath);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (interactive) {
        pullSolFiles = true;
    }
    await pullAllMostRecentSolFilesAndSourceCode(
        pullSourceCode,
        pullSolFiles,
        interactive,
        useSimbaPath,
    );
}

export default pull;