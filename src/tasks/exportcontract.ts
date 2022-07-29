import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import {
    getASTAndOtherInfo,
    writeAndReturnASTAndOtherInfo,
    promisifiedReadFile,
    walkDirForContracts,
    getContractKind,
    authErrors,
} from '@simbachain/web3-suites';
import axios from "axios";

interface Data {
    [key: string]: any;
}

interface Request {
    libraries: Record<any, any>;
    version: string;
    primary: string;
    import_data: Data;
}

/**
 * export contract to simbachain.com (can also be thought of as "importing" contract to simbachain.com)
 * @param hre 
 * @param primary optional param specifying which contract to export. if not present, contract is selected from prompts
 * @returns 
 */
const exportContract = async (
    hre: HardhatRuntimeEnvironment,
    primary?: string,
) => {
    const entryParams = {
        primary,
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
    let importData: Data = {};
    const contractNames = [];
    const supplementalInfo = {} as any;
    const authStore = await SimbaConfig.authStore();

    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }

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
        const contractType = getContractKind(name, ast);
        await writeAndReturnASTAndOtherInfo(name, contractSourceName);
        supplementalInfo[name] = {} as any;
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        importData[name].ast = astAndOtherInfo.ast;
        importData[name].source = astAndOtherInfo.source;
        importData[name].compiler = {'name': 'solc', 'version': astAndOtherInfo.compiler}
        supplementalInfo[name].contractType = contractType;
        supplementalInfo[name].sourceCode = astAndOtherInfo.source;
        choices.push({title: name, value: name});
    }
    let currentContractName;
    if (primary) {
        if ((primary as string) in importData) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
            currentContractName = primary;
            const currentData = importData[currentContractName];
            importData = {};
            importData[currentContractName] = currentData;
            SimbaConfig.log.debug(`importData: ${JSON.stringify(importData)}`);
        
            const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request: Request = {
                version: '0.0.2',
                primary: SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: importData,
                libraries: libraries,
            };
        
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: exporting contract ${chalk.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            
            try {
                const resp = await authStore.doPostRequest(
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
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
                }
                return;
            }
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    } else {
        const chosen = await prompt({
            type: 'multiselect',
            name: 'contracts',
            message: `${chalk.cyanBright(`Please select all contracts you want to export. Use the Space Bar to select or un-select a contract (You can also use -> to select a contract, and <- to un-select a contract). Hit Return/Enter when you are ready to export. If you have questions on exporting libraries, then please run 'npx hardhat simba help --topic libraries' .`)}`,
            choices,
        });

        SimbaConfig.log.debug(`chosen: ${JSON.stringify(chosen)}`);

        if (!chosen.contracts) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No contracts chosen!`)}`);
            return;
        }

        const libsArray = [];
        const nonLibsArray = [];
        for (let i = 0; i < chosen.contracts.length; i++) {
            const contractName = chosen.contracts[i];
            if (supplementalInfo[contractName].contractType === "library") {
                libsArray.push(contractName);
            } else {
                nonLibsArray.push(contractName);
            }
        }
        const allContracts = libsArray.concat(nonLibsArray);

        for (let i = 0; i < allContracts.length; i++) {
            const singleContractImportData = {} as any;
            currentContractName = allContracts[i];
            singleContractImportData[currentContractName] = importData[currentContractName]
            SimbaConfig.ProjectConfigStore.set('primary', currentContractName);
        
            SimbaConfig.log.debug(`singleContractImportData: ${JSON.stringify(singleContractImportData)}`);
        
            const libraries = await SimbaConfig.ProjectConfigStore.get("library_addresses") ? SimbaConfig.ProjectConfigStore.get("library_addresses") : {};
            SimbaConfig.log.debug(`libraries: ${JSON.stringify(libraries)}`);
            const request: Request = {
                version: '0.0.2',
                primary: SimbaConfig.ProjectConfigStore.get('primary'),
                import_data: singleContractImportData,
                libraries: libraries,
            };
        
            SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: exporting contract ${chalk.greenBright(`${currentContractName}`)} to SIMBA Chain`)}`);
            SimbaConfig.log.debug(`${chalk.cyanBright(`\nsimba: request: ${JSON.stringify(request)}`)}`);
            try {
                const resp = await authStore.doPostRequest(
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
                    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: Saved Contract ${chalk.greenBright(`${currentContractName}`)} to Design ID `)}${chalk.greenBright(`${resp.id}`)}`);
                } else {
                    SimbaConfig.log.error(`${chalk.red('\nsimba: EXIT : Error exporting contract to SIMBA Chain')}`);
                    return;
                }
            } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
            }
            return;
        }
        }
    }


}

task("export", "export contract(s) to Blocks")
    .setAction(async (taskArgs, hre) => {
        const {primary} = taskArgs;
        await exportContract(hre, primary);
    });

export default exportContract;