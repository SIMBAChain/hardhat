import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    SimbaConfig,
    chooseApplicationFromList,
    getBlockchains,
    getStorages,
    primaryConstructorRequiresArgs,
    primaryConstructorInputs,
    authErrors,
} from '@simbachain/web3-suites';
// const log: Logger = new Logger({minLevel: "error"});
import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';
import axios from "axios";

interface DeploymentArguments {
    [key: string]: any;
}

interface DeploymentRequest {
    blockchain: string;
    app_name: string;
    args: DeploymentArguments;
    storage?: string;
    api_name?: string;
    display_name?: string;
    language?: string;
    code?: string;
    pre_txn_hook?: string;
    lib_name?: string;
}

/**
 * deploy contract to simbachain.com
 * @param hre 
 * @returns 
 */
export const deployContract = async (
    hre: HardhatRuntimeEnvironment,
    primary?: string
) => {
    SimbaConfig.log.debug(`:: ENTER :`);
    const config = new SimbaConfig();
    if (!config.ProjectConfigStore.has("contracts_info")) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Please export your contract first with "npx hardhat simba export".`)}`);
        return;
    }

    const blockchainList = await getBlockchains(config);
    const storageList = await getStorages(config);

    if (!config.application) {
        try {
            await chooseApplicationFromList(config);
        } catch (e) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(e)}`)}`);
            return;
        }
    }

    const contractsInfo = SimbaConfig.ProjectConfigStore.get("contracts_info");

    if (!contractsInfo) {
        SimbaConfig.log.error(`${chalk.greenBright(`\nsimba: no contracts present in your contracts_info in simba.json. Did you forget to deploy contracts first by running ${chalk.greenBright(`$ npx hardhat simba export`)} ?`)}`);
        return;
    }
    let contractName;
    if (primary) {
        if ((primary as string) in contractsInfo) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
            contractName = primary;
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Primary contract ${primary} is not the name of a contract in this project`)}`);
            return;
        }
    } else {
        const choices = [];

        for (const [contractName, _] of Object.entries(contractsInfo)) {
            choices.push({title: contractName, value: contractName});
        }
    
        const response = await prompt({
            type: 'select',
            name: 'contract_name',
            message: 'Please pick which contract you want to deploy',
            choices,
        });
    
        if (!response.contract_name) {
            SimbaConfig.log.error(`${chalk.redBright('\nsimba: EXIT : No contract selected for deployment!')}`);
            throw new Error('No Contract Selected!');
        }
    
        contractName = response.contract_name;
        SimbaConfig.ProjectConfigStore.set("primary", contractName);
    }

    const contractInfo = contractsInfo[contractName];
    const sourceCode = contractInfo.source_code;
    const contractType = contractInfo.contract_type;
    const _isLibrary = (contractType === "library") ? true : false;
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: gathering info for deployment of contract ${chalk.greenBright(`${contractName}`)}`)}`)
    let chosen: any = {};
    const questions: prompt.PromptObject[] = [
        {
            type: 'text',
            name: 'api',
            message: `Please enter an API name for contract ${chalk.greenBright(`${contractName}`)} [^[w-]*$]`,
            validate: (str: string): boolean => !!/^[\w-]*$/.exec(str),
        },
        {
            type: 'select',
            name: 'blockchain',
            message: 'Please choose the blockchain to deploy to.',
            choices: blockchainList,
            initial: 0,
        },
        {
            type: 'select',
            name: 'storage',
            message: 'Please choose the storage to use.',
            choices: storageList,
            initial: 0,
        },
    ];
    const constructorRequiresParams = await primaryConstructorRequiresArgs();
    const paramInputQuestions: any = [];
    let inputNameToTypeMap: any = {};
    let inputsAsJson = true;
    if (constructorRequiresParams) {
        const constructorInputs = await primaryConstructorInputs();
        const allParamsByJson = "enter all params as json object";
        const paramsOneByOne = "enter params one by one from prompts";
        const paramInputChoices = [paramsOneByOne, allParamsByJson];
        const paramChoices = [];
        for (let i = 0; i < paramInputChoices.length; i++) {
            const entry = paramInputChoices[i];
            paramChoices.push({
                title: entry,
                value: entry,
            });
        }
        const promptChosen = await prompt({
            type: 'select',
            name: 'input_method',
            message: 'Your constructor parameters can be input as either a single json object or one by one from prompts. Which would you prefer?',
            choices: paramChoices,
        });

        if (!promptChosen.input_method) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : no param input method chosen!`)}`)
            return;
        }

        if (promptChosen.input_method === allParamsByJson) {
            questions.push({
                type: 'text',
                name: 'args',
                message: 'Please enter any arguments for the contract as a JSON dictionary.',
                validate: (contractArgs: string): boolean => {
                    if (!contractArgs) {
                        return true;
                    } // Allow empty strings
                    try {
                        JSON.parse(contractArgs);
                        return true;
                    } catch {
                        return false;
                    }
                },
            });
        } else {
            inputsAsJson = false;
            for (let i = 0; i < constructorInputs.length; i++) {
                const inputEntry = constructorInputs[i];
                const paramType = inputEntry.type;
                const paramName = inputEntry.name;
                inputNameToTypeMap[paramName] = paramType;
                paramInputQuestions.push({
                    type: "text",
                    name: paramName,
                    message: `please input value for param ${chalk.greenBright(`${paramName}`)} of type ${chalk.greenBright(`${paramType}`)}`,
                });
            }
        }
    }

    chosen = await prompt(questions);

    let inputsChosen = {} as any;
    if (!inputsAsJson) {
        inputsChosen = await prompt(paramInputQuestions);
        SimbaConfig.log.debug(`:: inputsChosen : ${JSON.stringify(inputsChosen)}`);
        for (const key in inputsChosen) {
            if (!inputNameToTypeMap[key].startsWith("string") || !inputNameToTypeMap[key].startsWith("address")) {
                try {
                    // trying and catching. there are custom data types that users can define
                    // that we won't be able to anticipate. so we try to parse those,
                    // and if they're really just extensions of 'string', then we continue
                    inputsChosen[key] = JSON.parse(inputsChosen[key]);
                } catch (e) {
                    continue;
                }
            }
        }
    }

    if (!chosen.api) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No API Name chosen!`)}`);
        return;
    }

    if (!chosen.blockchain) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT :  No blockchain chosen!`)}`);
        return;
    }

    if (!chosen.storage) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : No storage chosen!`)}`)
        return;
    }

    if (constructorRequiresParams && !chosen.args && !inputsChosen) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : Your contract requires constructor arguments`)}`)
        return;
    }

    const id = contractInfo.design_id;
    let deployArgs: DeploymentArguments = {};
    if (chosen.args) {
        deployArgs = JSON.parse(chosen.args) as DeploymentArguments;
    } else {
        if (config.ProjectConfigStore.has('defaultArgs')) {
            deployArgs = config.ProjectConfigStore.get('defaultArgs') as DeploymentArguments;
        } else {
            if (inputsChosen) {
                deployArgs = JSON.parse(JSON.stringify(inputsChosen));
            }
        }
    }

    let deployURL;
    let deployment: DeploymentRequest;
    if (_isLibrary) {
        deployURL = `organisations/${config.organisation.id}/deployed_artifacts/create/`;
        const b64CodeBuffer = Buffer.from(sourceCode)
        const base64CodeString = b64CodeBuffer.toString('base64')
        deployment = {
            args: deployArgs,
            language: "Solidity",
            code: base64CodeString,
            blockchain: chosen.blockchain,
            app_name: config.application.name,
            lib_name: config.ProjectConfigStore.get("primary"),
        };
    } else {
        deployURL = `organisations/${config.organisation.id}/contract_designs/${id}/deploy/`;
        deployment = {
            blockchain: chosen.blockchain,
            storage: chosen.storage,
            api_name: chosen.api,
            app_name: config.application.name,
            display_name: config.application.name,
            args: deployArgs,
        };
    }

    const authStore = await SimbaConfig.authStore();
    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.reject(new Error(authErrors.badAuthProviderInfo));
    }

    try {
        const resp = await authStore.doPostRequest(
            deployURL,
            deployment,
            "application/json",
            true,
        );
        if (!resp) {
            SimbaConfig.log.error(`${chalk.redBright(`simba: EXIT : error deploying contract`)}`);
            return;
        }
        const deployment_id = resp.deployment_id;
        const transaction_hash = resp.transaction_hash;
        config.ProjectConfigStore.set('deployment_id', deployment_id);
        SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: Contract deployment ID for contract ${contractName}:`)} ${chalk.greenBright(`${deployment_id}`)}`);
        SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba deploy: txn hash for contract ${contractName}:`)} ${chalk.greenBright(`${transaction_hash}`)}`);

        let deployed = false;
        let lastState = null;
        let retVal = null;

        do {
            const checkDeployURL = `organisations/${config.organisation.id}/deployments/${deployment_id}/`;
            const check_resp = await authStore.doGetRequest(
                checkDeployURL,
            );
            if (!check_resp) {
                SimbaConfig.log.error(`${chalk.redBright(`simba: EXIT : error checking deployment URL`)}`);
                return;
            }
            if (check_resp instanceof Error) {
                throw new Error(check_resp.message);
            }
            const state: any = check_resp.state;
            SimbaConfig.log.debug(`:: state : ${state}`);

            switch (state) {
                case 'INITIALISED':
                    if (lastState !== state) {
                        lastState = state;
                        SimbaConfig.log.info(
                            `${chalk.cyanBright('\nsimba deploy: Your contract deployment has been initialised...')}`,
                        );
                    }
                    break;
                case 'EXECUTING':
                    if (lastState !== state) {
                        lastState = state;
                        SimbaConfig.log.info(`${chalk.cyanBright('\nsimba deploy: deployment is executing...')}`);
                    }
                    break;
                case 'COMPLETED':
                    deployed = true;
                    const contractName = config.ProjectConfigStore.get("primary");
                    const contractsInfo = config.ProjectConfigStore.get("contracts_info") ?
                        config.ProjectConfigStore.get("contracts_info") :
                        {};
                    contractsInfo[contractName] = contractsInfo[contractName] ?
                    contractsInfo[contractName] :
                    {};
                    contractsInfo[contractName].application = SimbaConfig.application.name;
                    if (!_isLibrary) {
                        const contractAddress = check_resp.primary.address;
                        contractsInfo[contractName].address = contractAddress;
                        contractsInfo[contractName].deployment_id = deployment_id;
                        contractsInfo[contractName].transaction_hash = transaction_hash;
                        config.ProjectConfigStore.set("contracts_info", contractsInfo);
                        const most_recent_deployment_info = {
                            address: contractAddress,
                            transaction_hash,
                            deployment_id,
                            type: "contract"
                        };
                        config.ProjectConfigStore.set('most_recent_deployment_info', most_recent_deployment_info);
                        SimbaConfig.log.info(
                            `${chalk.cyanBright(`\nsimba deploy: contract ${chalk.greenBright(`${contractName}`)} was deployed to ${chalk.greenBright(`${contractAddress}`)} with deployment_id ${chalk.greenBright(`${deployment_id}`)} and transaction_hash ${chalk.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json under contracts_info.${contractName}.`)}`,
                        );
                    } else {
                        const deploymentInfo = check_resp.deployment;
                        for (let i = 0; i < deploymentInfo.length; i++) {
                            const entry = deploymentInfo[i];
                            if (!(entry.name === contractName)) {
                                continue;
                            }
                            const libraryAddress = entry.address;
                            let contractsInfo = config.ProjectConfigStore.get("contracts_info") as any;
                            contractsInfo[contractName].address = libraryAddress;
                            contractsInfo[contractName].deployment_id = deployment_id;
                            contractsInfo[contractName].transaction_hash = transaction_hash;
                            config.ProjectConfigStore.set("contracts_info", contractsInfo);
                            const most_recent_deployment_info = {
                                address: libraryAddress,
                                deployment_id,
                                transaction_hash,
                                type: "library",
                            };
                            const libraryAddresses = config.ProjectConfigStore.get("library_addresses") ?
                                config.ProjectConfigStore.get("library_addresses") :
                                {};
                            libraryAddress[contractName] = libraryAddress;
                            config.ProjectConfigStore.set("library_addresses", libraryAddresses);
                            config.ProjectConfigStore.set("most_recent_deployment_info", most_recent_deployment_info);
                            SimbaConfig.log.info(`${chalk.cyanBright(`simba: your library was deployed to address ${chalk.greenBright(`${libraryAddress}`)}, with deployment_id ${chalk.greenBright(`${deployment_id}`)} and transaction_hash ${chalk.greenBright(`${transaction_hash}`)}. Information pertaining to this deployment can be found in your simba.json`)}`);
                        }
                    }
                    break;
                case 'ABORTED':
                    deployed = true;
                    SimbaConfig.log.error(`${chalk.red('\nsimba deploy: Your contract deployment was aborted...')}`);
                    SimbaConfig.log.error(`${chalk.red(`\nsimba deploy: EXIT : ${check_resp.error}`)}${check_resp.error}`);
                    SimbaConfig.log.debug(`:: EXIT :`);
                    retVal = new Error(check_resp.error);
                    break;
            }
        } while (!deployed);

        Promise.resolve(retVal);
    }  catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error.response.data)}`)}`)
        } else {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: EXIT : ${JSON.stringify(error)}`)}`);
        }
        return;
    }
    SimbaConfig.log.debug(`:: EXIT :`);
}

export default deployContract;