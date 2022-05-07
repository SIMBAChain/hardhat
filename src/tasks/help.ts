import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { log } from '@simbachain/web3-suites';
import {default as prompt} from 'prompts';
import {
    promisifiedReadFile,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

const LOGIN = "login";
const EXPORT = "export";
const DEPLOY = "deploy";
const LOGOUT = "logout";
const SIMBAJSON = "simbajson";
const GENERALPROCESS = "generalprocess";

const PATHTOHELPJSON = "/Users/brendanbirch/development/simba/sep/hardhat/simba_hardhat/help.json"

export async function help(
    hre: HardhatRuntimeEnvironment,
    topic?: string,
) {
    let helpTopic: string;

    if (topic) {
        log.debug(`topic: ${topic}`);
        helpTopic = topic;
    } else {

        const paramInputChoices = [
            LOGIN,
            EXPORT,
            DEPLOY,
            LOGOUT,
            SIMBAJSON,
            GENERALPROCESS,
        ];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const helpTopicPrompt = await prompt({
            type: 'select',
            name: 'help_topic',
            message: 'Please choose which commmand you would like help with',
            choices: paramChoices,
        });

        if (!helpTopicPrompt.help_topic) {
            log.error(`:: EXIT : ERROR : no help topic selected!`)
            return;
        }

        helpTopic = helpTopicPrompt.help_topic;
    }

    switch(helpTopic) {
        case LOGIN: { 
           await loginHelp();
           break; 
        }
        case EXPORT: {
            await exportHelp();
            break;
        }
        case DEPLOY: {
            await deployHelp();
            break;
        }
        case LOGOUT: {
            await logoutHelp();
            break;
        }
        case SIMBAJSON: {
            await simbaJsonHelp();
            break;
        }
        case GENERALPROCESS: {
            await generalProcessHelp();
            break;
        }
        default: { 
           console.log(`Please enter a valid topic for simba help: 'simbaJson', 'login', 'export', 'deploy', or 'logout'`);
           break; 
        } 
    }

}

async function loginHelp() {
    const message = await helpMessage("loginHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function exportHelp() {
    const message = await helpMessage("exportHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function deployHelp() {
    const message = await helpMessage("deployHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function helpMessage(
    topic: string,
): Promise<string> {
    const buf = await promisifiedReadFile(PATHTOHELPJSON, {flag: 'r'});
    const parsed = JSON.parse(buf.toString());
    const message = parsed[topic];
    return message;

}

task("help", "export contract(s) to Blocks")
.setAction(async (hre) => {
    await help(hre);
});

export default help;