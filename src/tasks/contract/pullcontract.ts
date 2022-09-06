import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {default as chalk} from 'chalk';
import {
    pullAllMostRecentSolFilesAndSourceCode,
    pullMostRecentRecentSolFileFromContractName,
    pullMostRecentSourceCodeFromContractName,
    pullMostRecentFromContractName,
    pullContractFromDesignId,
    SimbaConfig,
} from '@simbachain/web3-suites';


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
        await pullContractFromDesignId(designID, useSimbaPath);
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