import {
    SimbaConfig,
    AllDirs,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

/**
 * used for setting/overriding default directories, or for getting those directories
 * 
 * THE 'SET' METHOD FOR THIS FUNCTION SHOULD NOT BE USED UNLESS SOMEONE KNOWS EXACTLY
 * WHAT THEY ARE DOING!
 * @param method can be 'set' or 'get'
 * @param dirName 
 * @param dirPath 
 * @returns 
 */
export const setOrGetDir = (
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