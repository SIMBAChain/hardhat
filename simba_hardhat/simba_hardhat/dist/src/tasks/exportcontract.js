"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("request-promise/errors");
const web3_suites_2 = require("@simbachain/web3-suites");
const web3_suites_3 = require("@simbachain/web3-suites");
;
const exportContract = async (hre, primary, deleteNonExportedArtifacts = true) => {
    const entryParams = {
        primary,
        deleteNonExportedArtifacts,
    };
    web3_suites_1.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    // Not putting any "isLoggedIn()" logic here because SimbaConfig.authStore.doGetRequest handles that
    const buildDir = web3_suites_1.SimbaConfig.buildDirectory;
    let files = [];
    try {
        files = await (0, web3_suites_3.walkDirForContracts)(buildDir, '.json');
    }
    catch (e) {
        const err = e;
        if (err.code === 'ENOENT') {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "npx hardhat compile" ?\n`)}`);
            return;
        }
        web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }
    const choices = [];
    const importData = {};
    const contractNames = [];
    for (const file of files) {
        if (file.endsWith('Migrations.json') || file.endsWith('dbg.json')) {
            continue;
        }
        web3_suites_1.log.info(`${chalk_1.default.green(`\nsimba export: exporting file: ${file}`)}`);
        const buf = await (0, web3_suites_3.promisifiedReadFile)(file, { flag: 'r' });
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const contractSourceName = parsed.sourceName;
        const _astSourceAndCompiler = await (0, web3_suites_2.writeAndReturnASTSourceAndCompiler)(name, contractSourceName);
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        importData[name].ast = _astSourceAndCompiler.ast;
        importData[name].source = _astSourceAndCompiler.source;
        importData[name].compiler = { 'name': 'solc', 'version': _astSourceAndCompiler.compiler };
        choices.push({ title: name, value: name });
    }
    if (primary) {
        if (primary in importData) {
            web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', primary);
        }
        else {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    }
    else {
        const chosen = await (0, prompts_1.default)({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });
        if (!chosen.contract) {
            web3_suites_1.log.error(`${chalk_1.default.redBright(`\nsimba: EXIT : No primary contract chosen!`)}`);
            return;
        }
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('primary', chosen.contract);
    }
    if (deleteNonExportedArtifacts) {
        const primaryName = web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary');
        for (let i = 0; i < contractNames.length; i++) {
            const contractName = contractNames[i];
            if (contractName !== primaryName) {
                delete importData[contractName];
            }
        }
    }
    web3_suites_1.log.debug(`importData: ${JSON.stringify(importData)}`);
    const request = {
        version: '0.0.2',
        primary: web3_suites_1.SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
    };
    web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Sending to SIMBA Chain SCaaS')}`);
    try {
        const resp = await web3_suites_1.SimbaConfig.authStore.doPostRequest(`organisations/${web3_suites_1.SimbaConfig.organisation.id}/contract_designs/import/truffle/`, request, "application/json", true);
        web3_suites_1.SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
        if (resp.id) {
            web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Saved to Contract Design ID ')}${chalk_1.default.greenBright(`${resp.id}`)}`);
        }
        else {
            web3_suites_1.log.error(`${chalk_1.default.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
        }
    }
    catch (e) {
        if (e instanceof errors_1.StatusCodeError) {
            if ('errors' in e.error && Array.isArray(e.error.errors)) {
                e.error.errors.forEach((error) => {
                    web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${error.status}|CODE:${error.code}] Error Saving contract ${error.title} - ${error.detail}`);
                });
            }
            else {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${e.error.errors[0].status}|CODE:${e.error.errors[0].code}] Error Saving contract ${e.error.errors[0].title} - ${e.error.errors[0].detail}`);
            }
            return Promise.resolve();
        }
        const err = e;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                web3_suites_1.log.error(`${chalk_1.default.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${err.errors[0].code}] Error Saving contract ${err.errors[0].detail}`);
                return Promise.resolve();
            }
        }
        return;
    }
};
(0, config_1.task)("export", "export contract(s) to Blocks")
    .setAction(async (taskArgs, hre) => {
    const { primary, deleteNonExportedArtifacts } = taskArgs;
    await exportContract(hre, primary, deleteNonExportedArtifacts);
});
exports.default = exportContract;
//# sourceMappingURL=exportcontract.js.map