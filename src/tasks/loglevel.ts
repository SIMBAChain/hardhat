import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    LogLevel,
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';

export const setLogLevel = async (
    hre: HardhatRuntimeEnvironment,
    level?: LogLevel,
) => {
    if (level) {
        const lowLevel = level.toLowerCase();
        if (!Object.values(LogLevel).includes(lowLevel as any)) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: log level can only be one of: 'error', 'debug', 'info', 'warn', 'fatal', 'silly', 'trace'`)}`);
            return;
        }
        SimbaConfig.logLevel = lowLevel as any;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${lowLevel}`)}`);
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
            return;
        }
        SimbaConfig.logLevel = logLevelPrompt.log_level;
        SimbaConfig.log.info(`${chalk.cyanBright(`simba: log level set to ${logLevelPrompt.log_level}`)}`);
        return;
    }
}

task("loglevel", "set level for tslog logger")
    .setAction(async (taskArgs, hre) => {
        const {level} = taskArgs;
        await setLogLevel(hre, level);
    });

export default setLogLevel;