import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as path from 'path';
import * as fs from "fs";
import {
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import { StatusCodeError } from 'request-promise/errors';
import {
    getASTAndOtherInfo,
    writeAndReturnASTAndOtherInfo,
    promisifiedReadFile,
    walkDirForContracts,
    getContractKind,
} from '@simbachain/web3-suites';;

interface Data {
    [key: string]: any;
}

interface Request {
    id: string;
    version: string;
    primary: string;
    import_data: Data;
}

/**
 * export contract to simbachain.com (can also be thought of as "importing" contract to simbachain.com)
 * @param hre 
 * @param primary optional param specifying which contract to export. if not present, contract is selected from prompts
 * @param deleteNonExportedArtifacts 
 * @returns 
 */
const exportContract = async (
    hre: HardhatRuntimeEnvironment,
    primary?: string,
    deleteNonExportedArtifacts: boolean = true,
) => {
    const entryParams = {
        primary,
        deleteNonExportedArtifacts,
    };
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    const buildDir = SimbaConfig.buildDirectory;
    let files: string[] = [];

    try {
        files = await walkDirForContracts(buildDir, '.json');
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Simba was not able to find any build artifacts.\nDid you forget to run: "npx hardhat compile" ?\n`)}`);
            return;
        }
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(err)}`)}`);
        return;
    }

    const choices = [];
    const importData: Data = {};
    const contractNames = [];
    const supplementalInfo = {} as any;

    for (const file of files) {
        if (file.endsWith('Migrations.json') || file.endsWith('dbg.json')) {
            continue;
        }
        SimbaConfig.log.debug(`${chalk.green(`\nsimba export: reading file: ${file}`)}`);
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const contractSourceName = parsed.sourceName;
        const astAndOtherInfo = await getASTAndOtherInfo(name, contractSourceName) as any;
        const ast = astAndOtherInfo.ast;
        const contractType = getContractKind(ast);
        await writeAndReturnASTAndOtherInfo(name, contractSourceName);
        supplementalInfo[name] = {} as any;
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        importData[name].ast = astAndOtherInfo.ast;
        importData[name].source = astAndOtherInfo.source;
        importData[name].compiler = {'name': 'solc', 'version': astAndOtherInfo.compiler}
        supplementalInfo[name].contractType = contractType;
        // supplementalInfo[name].contractName = astAndOtherInfo.contractName;
        // supplementalInfo[name].contractSourceName = astAndOtherInfo.contractSourceName;
        // supplementalInfo[name].language = astAndOtherInfo.language;
        supplementalInfo[name].sourceCode = astAndOtherInfo.source;
        choices.push({title: name, value: name});
    }
    let currentContractName;
    if (primary) {
        if ((primary as string) in importData) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
            currentContractName = primary;
            // SimbaConfig.ProjectConfigStore.set('language', supplementalInfo[primary].language);
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    } else {
        const chosen = await prompt({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });

        if (!chosen.contract) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No primary contract chosen!`)}`);
            return;
        }

        // the following are things we need to store for deploy, but don't put into
        // importData above, because we don't need the info in our export call
        SimbaConfig.ProjectConfigStore.set('primary', chosen.contract);
        // // no longer setting these in top level of simba.json
        // SimbaConfig.ProjectConfigStore.set('isLib', supplementalInfo[chosen.contract].isLib);
        // SimbaConfig.ProjectConfigStore.set('sourceCode', supplementalInfo[chosen.contract].sourceCode)
        currentContractName = chosen.contract;
        // SimbaConfig.ProjectConfigStore.set('language', supplementalInfo[chosen.contract].language);
    }

    if (deleteNonExportedArtifacts) {
        const primaryName = SimbaConfig.ProjectConfigStore.get('primary');
        for (let i = 0; i < contractNames.length; i++) {
            const contractName = contractNames[i];
            if (contractName !== primaryName) {
                delete importData[contractName];
            }
        }
    }

    SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);

    const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
    SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
    const request = {
        version: '0.0.2',
        primary: SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
        libraries: libraries,
    };

    SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Sending to SIMBA Chain SCaaS')}`);
    SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
    try {
        const resp = await SimbaConfig.authStore.doPostRequest(
            `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
            request,
            "application/json",
            true,
        );
        if (!resp) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : error exporting contract`)}`);
            return;
        }

        if (resp.id) {
            // // no longer setting top level field "design_id", since this should be set inside contracts_info field
            // SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
            const contractType = supplementalInfo[currentContractName].contractType;
            const sourceCode = supplementalInfo[currentContractName].sourceCode;
            const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info") ?
                SimbaConfig.ProjectConfigStore.get("contracts_info") :
                {};
            contractsInfo[currentContractName] = {
                design_id: resp.id,
                contract_type: contractType,
                source_code: sourceCode,
            }
            SimbaConfig.ProjectConfigStore.set("contracts_info", contractsInfo)
            SimbaConfig.log.info(`${chalk.cyanBright('\nsimba: Saved to Contract Design ID ')}${chalk.greenBright(`${resp.id}`)}`);
        } else {
            SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
        }
    } catch (e) {
        if (e instanceof StatusCodeError) {
            if('errors' in e.error && Array.isArray(e.error.errors)){
                e.error.errors.forEach((error: any)=>{
                    SimbaConfig.log.error(
                        `${chalk.red('\nsimba export: ')}[STATUS:${
                            error.status
                        }|CODE:${
                            error.code
                        }] Error Saving contract ${
                            error.title
                        } - ${error.detail}`,
                    );
                });
            } else {
                SimbaConfig.log.error(
                    `${chalk.red('\nsimba export: ')}[STATUS:${
                        e.error.errors[0].status
                    }|CODE:${
                        e.error.errors[0].code
                    }] Error Saving contract ${
                        e.error.errors[0].title
                    } - ${e.error.errors[0].detail}`,
                );
            }

            return Promise.resolve();
        }
        const err = e as any;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                SimbaConfig.log.error(
                    `${chalk.red('\nsimba export: ')}[STATUS:${err.errors[0].status}|CODE:${
                        err.errors[0].code
                    }] Error Saving contract ${err.errors[0].detail}`,
                );
                SimbaConfig.log.debug(`:: EXIT :`);
                return Promise.resolve();
            }
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}

task("export", "export contract(s) to Blocks")
    .setAction(async (taskArgs, hre) => {
        const {primary, deleteNonExportedArtifacts} = taskArgs;
        await exportContract(hre, primary, deleteNonExportedArtifacts);
    });

export default exportContract;