"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const config_1 = require("hardhat/config");
const web3_suites_1 = require("@simbachain/web3-suites");
const prompts_1 = __importDefault(require("prompts"));
const web3_suites_2 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const LOGIN = "login";
const EXPORT = "export";
const DEPLOY = "deploy";
const LOGOUT = "logout";
const SIMBAJSON = "simbajson";
const GENERALPROCESS = "generalprocess";
const PATHTOHELPJSON = "/Users/brendanbirch/development/simba/sep/hardhat/simba_hardhat/help.json";
async function help(hre, topic) {
    let helpTopic;
    if (topic) {
        web3_suites_1.log.debug(`topic: ${topic}`);
        helpTopic = topic;
    }
    else {
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
        const helpTopicPrompt = await prompts_1.default({
            type: 'select',
            name: 'help_topic',
            message: 'Please choose which commmand you would like help with',
            choices: paramChoices,
        });
        if (!helpTopicPrompt.help_topic) {
            web3_suites_1.log.error(`:: EXIT : ERROR : no help topic selected!`);
            return;
        }
        helpTopic = helpTopicPrompt.help_topic;
    }
    switch (helpTopic) {
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
exports.help = help;
async function loginHelp() {
    const message = await helpMessage("loginHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function exportHelp() {
    const message = await helpMessage("exportHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function deployHelp() {
    const message = await helpMessage("deployHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    web3_suites_1.log.info(`${chalk_1.default.cyanBright("simba help:")}${chalk_1.default.greenBright(message)}`);
}
async function helpMessage(topic) {
    const buf = await web3_suites_2.promisifiedReadFile(PATHTOHELPJSON, { flag: 'r' });
    const parsed = JSON.parse(buf.toString());
    const message = parsed[topic];
    return message;
}
config_1.task("help", "export contract(s) to Blocks")
    .setAction(async (hre) => {
    await help(hre);
});
exports.default = help;
//# sourceMappingURL=help.js.map