import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    SimbaConfig,
    AllDirs,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

const setOrGetDir = (
    hre: HardhatRuntimeEnvironment,
    method: string,
    dirName?: AllDirs,
    dirPath?: string,
): void => {
    const entryParams = {
        method,
        dirPath,
    }
    SimbaConfig.log.debug(`:: ENTER : entryParams : ${JSON.stringify(entryParams)}`);
    if (method.toLowerCase() === "get") {
        SimbaConfig.printChalkedDirs();
        return;
    }
    if (!dirName || !dirPath) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: must specify dirName and dirPath`)}`);
        return;
    }
    if (method.toLowerCase() === "set") {
        SimbaConfig.setDirectory(dirName, dirPath);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}

export default setOrGetDir;