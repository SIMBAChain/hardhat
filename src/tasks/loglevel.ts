import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    LogLevel,
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';

/**
 * set minimum log level for logger
 * @param level 
 * @returns 
 */
export const setLogLevel = async (
    level?: LogLevel,
) => {
    SimbaConfig.log.debug(`:: ENTER : ${level}`);
    if (level) {
        const lowLevel = level.toLowerCase();
        if (!Object.values(LogLevel).includes(lowLevel as any)) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: log level can only be one of: 'error', 'debug', 'info', 'warn', 'fatal', 'silly', 'trace'`)}`);
            return;
        }
        SimbaConfig.logLevel = lowLevel as any;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${lowLevel}`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    } else {
        const paramInputChoices = [
            LogLevel.DEBUG,
            LogLevel.ERROR,
            LogLevel.FATAL,
            LogLevel.INFO,
            LogLevel.SILLY,
            LogLevel.TRACE,
            LogLevel.WARN,
        ];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const logLevelPrompt = await prompt({
            type: 'select',
            name: 'log_level',
            message: 'Please choose the minimum level to set your logger to',
            choices: paramChoices,
        });

        if (!logLevelPrompt.log_level) {
            SimbaConfig.log.error(`:: EXIT : ERROR : no log level selected!`)
            SimbaConfig.log.debug(`:: EXIT :`);
            return;
        }
        SimbaConfig.logLevel = logLevelPrompt.log_level;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${logLevelPrompt.log_level}`)}`);
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}

export default setLogLevel;