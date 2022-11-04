import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { 
    SimbaConfig,
} from '@simbachain/web3-suites';
import {default as prompt} from 'prompts';
import {default as chalk} from 'chalk';

enum HelpCommands {
    LOGIN = "login",
    EXPORT = "export",
    DEPLOY = "deploy",
    LOGOUT = "logout",
    SIMBAJSON = "simbajson",
    GENERALPROCESS = "generalprocess",
    LOGLEVEL = "loglevel",
    LIBRARIES = "libraries",
    PULL = "pull",
    VIEWCONTRACTS = "viewcontracts",
    CICD = "cicd",
    SIMBAINFO = "simbainfo",
    GETDIRS = "getdirs",
    SETDIR = "setdir",
    RESETDIR = "resetdir",
    DELETECONTRACT = "deletecontract",
}

/**
 * get help info
 * @param topic 
 * @returns 
 */
export async function help(
    topic?: string,
) {
    let helpTopic: string;
    SimbaConfig.log.debug(`:: ENTER : ${topic}`);
    const paramInputChoices = [
        HelpCommands.LOGIN,
        HelpCommands.EXPORT,
        HelpCommands.DEPLOY,
        HelpCommands.LOGOUT,
        HelpCommands.SIMBAJSON,
        HelpCommands.GENERALPROCESS,
        HelpCommands.LOGLEVEL,
        HelpCommands.LIBRARIES,
        HelpCommands.PULL,
        HelpCommands.VIEWCONTRACTS,
        HelpCommands.CICD,
        HelpCommands.SIMBAINFO,
        HelpCommands.GETDIRS,
        HelpCommands.SETDIR,
        HelpCommands.RESETDIR,
        HelpCommands.DELETECONTRACT,
    ];

    if (topic) {
        SimbaConfig.log.debug(`topic: ${topic}`);
        helpTopic = topic;
    } else {
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
            message: 'Please choose which topic you would like help with',
            choices: paramChoices,
        });

        if (!helpTopicPrompt.help_topic) {
            SimbaConfig.log.error(`:: EXIT : ERROR : no help topic selected!`)
            return;
        }

        helpTopic = helpTopicPrompt.help_topic;
    }

    switch(helpTopic) {
        case HelpCommands.LOGIN: { 
           await loginHelp();
           break; 
        }
        case HelpCommands.EXPORT: {
            await exportHelp();
            break;
        }
        case HelpCommands.DEPLOY: {
            await deployHelp();
            break;
        }
        case HelpCommands.LOGOUT: {
            await logoutHelp();
            break;
        }
        case HelpCommands.SIMBAJSON: {
            await simbaJsonHelp();
            break;
        }
        case HelpCommands.GENERALPROCESS: {
            await generalProcessHelp();
            break;
        }
        case HelpCommands.LOGLEVEL: {
            await logLevelHelp();
            break;
        }
        case HelpCommands.LIBRARIES: {
            await librariesHelp();
            break;
        }
        case HelpCommands.PULL: {
            await pullHelp();
            break;
        }
        case HelpCommands.VIEWCONTRACTS: {
            await viewContractsHelp();
            break;
        }
        case HelpCommands.CICD: {
            await cicdHelp();
            break;
        }
        case HelpCommands.SIMBAINFO: {
            await simbaInfoHelp();
            break;
        }
        case HelpCommands.GETDIRS: {
            await getDirsHelp();
            break;
        }
        case HelpCommands.SETDIR: {
            await setDirHelp();
            break;
        }
        case HelpCommands.RESETDIR: {
            await resetDirHelp();
            break;
        }
        case HelpCommands.DELETECONTRACT: {
            await deleteContractHelp();
            break;
        }
        default: { 
           SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: Please enter a valid topic from these choices: ${chalk.greenBright(`${JSON.stringify(paramInputChoices)}.`)} For example, run '$ npx hardhat simba help --topic deploy' for help deploying your contract.`)}`);
           break; 
        } 
    }

}
/**
 * the following functions call the helper function helpMessage
 */

async function loginHelp() {
    const message = await helpMessage("loginHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function exportHelp() {
    const message = await helpMessage("exportHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function deployHelp() {
    const message = await helpMessage("deployHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function logoutHelp() {
    const message = await helpMessage("logoutHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function simbaJsonHelp() {
    const message = await helpMessage("simbaJsonHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function generalProcessHelp() {
    const message = await helpMessage("generalProcessHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function logLevelHelp() {
    const message = await helpMessage("logLevelHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function librariesHelp() {
    const message = await helpMessage("librariesHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}
async function pullHelp() {
    const message = await helpMessage("pullHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function viewContractsHelp() {
    const message = await helpMessage("viewContractsHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function cicdHelp() {
    const message = await helpMessage("cicdHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function simbaInfoHelp() {
    const message = await helpMessage("simbaInfoHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function getDirsHelp() {
    const message = await helpMessage("getDirsHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function setDirHelp() {
    const message = await helpMessage("setDirHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function resetDirHelp() {
    const message = await helpMessage("resetDirHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

async function deleteContractHelp() {
    const message = await helpMessage("deleteContractHelp");
    SimbaConfig.log.info(`${chalk.cyanBright("simba help:")}${chalk.greenBright(message)}`);
}

/**
 * grabs help message from helpOptions object
 * @param topic 
 * @returns 
 */
async function helpMessage(
    topic: string,
): Promise<string> {
    SimbaConfig.log.debug(`:: ENTER : ${topic}`);
    const message = helpOptions[topic];
    SimbaConfig.log.debug(`:: EXIT : ${message}`);
    return message;
}

const helpOptions: any = {
    generalProcessHelp: "\n\nThe general process to follow for compiling, exporting, and deploying contracts is as follows:\n\n1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run\n\n\t$ npx hardhat simba help --topic simbajson\n\n2. Next, you'll need to login to SIMBA Chain. To do so, run\n\n\t$ npx hardhat simba login\n\nThen follow the prompts to choose your organization and application.\n\n3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run\n\n\t$ npx hardhat compile\n\n4. Next, you will need to export your contracts. What this will do is save your contracts to your organization's saved contracts on simbachain.com. To export, run\n\n\t$ npx hardhat simba export\n\nThen follow the prompts to select which contract you want to export. For more information on export, run\n\n\t$ npx hardhat simba help --topic export.\n\n5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run\n\n\t$ npx hardhat simba deploy\n\nFor more information on deploying, run\n\n\t$ npx hardhat simba help --topic deploy\n\n6. If you would like to logout, which deletes your auth token info in authconfig.json, just run\n\n\t$ npx hardhat simba logout\n\n",
    simbaJsonHelp: "\n\nBefore you are able to do anything like login, export, or deploy, your simba.json file will need to be configured properly, as follows.\n\n1. baseURL: this is the base URL that your organization and application live at. An example would be 'https://simba-dev-api.platform.simbachain.com/v2'\n\n2. web3Suite: this field should be 'hardhat'.\n\n",
    loginHelp: "Once your simba.json is configured (please run $ npx hardhat simba help --topic simbajson for help on that topic), all you have to do for interactive login is run\n\n\t$ npx hardhat simba login\n\nand follow the interactive prompts.\n\nThere is also a non-interactive login mode. This mode is mainly for CI/CD, but you can run this login mode like a normal login command if you have a few environment variables set, and it will use a client credentials flow for login. You will need to set\n\n1. SIMBA_AUTH_CLIENT_ID for your client ID\n2. SIMBA_AUTH_CLIENT_SECRET for your client secret, and\n3. SIMBA_AUTH_CLIENT_ENDPOINT for your auth endpoint.\n\nNOTE: SIMBA_AUTH_CLIENT_ENDPOINT defaults to '/o/' if not set.\n\nTo run login in non-interactive mode, you can run with org and app flag:\n\n\t$ npx hardhat simba login --interactive false --org <myOrg> --app <myApp>\n\nOr you can run with just the app flag, if you already have logged into an org before, and just want to switch your app:\n\n\t$ npx hardhat simba login --interactive false --app <myApp>\n\nIf you already have an org and app set in simba.json, and want to use that org and app, you can just run:\n\n\t$ npx hardhat simba login --interactive false\n\nHowever, if you specify an org, you must specify an app. The following will throw an error:\n\n\t$ npx hardhat simba login --interactive false --org <myOrg>\n\n",
    exportHelp: "\n\nOnce you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run\n\n\t$ npx hardhat simba export\n\nYou will then be prompted to select all contracts you want to export.\n\nIf you want to export one specific contract, you can specify a primary contract by passing the --prm flag, followed by the contract name:\n\n\t$ npx hardhat simba export --prm MyPrimaryContract\n\nThere is also a non-interactive export mode. This mode is mainly for CI/CD, but it can be run just like any other export command. If you want to export all contracts that have compiled changes since the last time you exported, then you can export in non-interactive mode. Note that this will not export contracts that are strictly dependencies (eg OpenZeppelin imported contracts). To run export in non-interactive mode, run\n\n\t$ npx hardhat simba export --interactive false\n\nIf you want to update an existing contract instead of saving another copy you can use the --savemode param with 'update'\n\n\t$ npx hardhat simba export --savemode update\n\nA note on exporting contracts with libraries/dependencies: if you are going to be exporting contract X, and it depends on library Y, then you need to export and deploy library Y before you export and deploy contract X. This does not mean that if you've ALREADY exported libray Y in a previous export command, you need to export it again. Also, note that if library Y is an OpenZeppelin library/contract, you do NOT need to export it before you export contract X.",
    deployHelp: "\n\nAfter you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, you have two options. First, you can run\n\n\t$ npx hardhat simba deploy\n\nRunning this command will allow you to then select which contract you want to deploy from a list of contracts you have exported. Alternatively, you can specify the primary contract you want to deploy by running:\n\n\t$ npx hardhat simba deploy --prm MyContract\n\n\n\nYou will then be prompted to:\n\n\t1. choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)\n\n\t2. choose an API name for your contract\n\n\t3. select the blockchain you want to deploy to\n\n\t4. choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)\n\n\t5. and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt\n\n",
    logoutHelp: "\n\nIf you want to logout, then you can do so by running\n\n\t$ npx hardhat simba logout\n\nDoing so will delete your auth token in authconfig.json\n\n",
    logLevelHelp: "\n\nThe Simba hardhat plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:\n\n\t$ npx hardhat simba loglevel\n\nOr you can set the specific log level from the CLI:\n\n\t$ npx hardhat simba loglevel --lvl <desired log level>\n\n",
    librariesHelp: "\n\nYou do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then FIRST deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses. This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed. You don't need to do anything with the library_addresses info; all you need to remember is to deploy the library BEFORE you deploy the contract that depends on it.\n\nAdding libraries: If a contract that you are trying to deploy requires an external library that you did not deploy to SIMBA Chain, but you have the name and address of that library, then you can add the library by running the following command, which does not take parameters:\n\n\t$ npx hardhat simba addlib\n\nAnd you will then be prompted to specify the name and address of your library. If you want to specify the name and address of the library from the CLI, then you can run:\n\n\t$ npx hardhat simba addlib --libname <library name> --libaddr <library address>\n\n",
    pullHelp: "\n\nThis command is mainly designed to be used in the CI/CD process, but it can actually be used for many things. Regarding the CI/CD use, if you use CI/CD to export your contracts in the CI/CD pipeline after you push, then you'll need to update your project's simba.json after you do a git pull. This is because the plugin relies on the 'source_code' field for each contract in your simba.json's 'contract_info' section to know which contracts to export. So to get the most up to date version of your exported contracts' source code in your simba.json, just run:\n\n\t$ npx hardhat simba pull\n\nIn addition to pulling source code for your simba.json, you can also use the pull command to pull the most recent versions of your solidity contracts from SIMBA Chain and place them in your /contracts/ directory.\n\nA brief note on file structure is worthwhile here. By default, contracts pulled from SIMBA Chain will be written to /contracts/SimbaImports/ directory. If you would like to place pulled files in the top level of your /contracts/ directory, then you can pass the --usesimbapath false flag in your call.\n\nA note on file names is also in order. Files that are pulled form SIMBA are placed into files named after the contract name. So if you have two contracts, token1 and token2, which both originally lived in OurTokens.sol. Then both of those will end up in files named token1.sol and token2.sol. This is done becuase, currently, contracts that are pushed to SIMBA Chain sit in a flat structure, without sub-directories.\n\nUsually, you shouldn't need to do pull contracts from SIMBA if you have git pulled, but there may be cases when, for instance, you want ALL of your most recent contracts from your SIMBA Chain organisation, even ones that weren't living in your current project. In that case, you can run:\n\n\t$ npx hardhat simba pull --pullsolfiles true\n\nThis will pull all most recent contracts from your SIMBA Chain org and place them in your /contracts/SimbaImports/ folder.\n\nIf you want to place your pulled contracts in the top level of your /contracts/ directory, instead of into /contracts/SimbaImports/, then you can run:\n\n\t$ npx hardhat simba pull --pullsolfiles true --usesimbapath false\n\nIf you would like to interactively choose which .sol contract files to choose, in addition to auto pulling your source code for your simba.json, you can run:\n\n\t$ npx hardhat simba pull --interactive true\n\nIf you would like to skip pulling your simba.json source code (though you really should not), you can set the --pullsourcecode flag to false. For example, the following command will only pull your .sol contract files:\n\n\t$ npx hardhat simba pull --pullsourcecode false --pullsolfiles true\n\nIf you would like to pull your .sol contract files interactively, while skipping your simba.json source code pull, you can run:\n\n\t$ npx hardhat simba pull --pullsourcecode false --interactive true\n\nIf you want to pull a specific contract's most recently exported edition, by name, from SIMBA, then you can run:\n\n\t$ npx hardhat simba pull --contractname <your contract name>\n\nIf you would like to pull a specific contract version from its design_id, you can run:\n\n\t$ npx hardhat simba pull --id <your contract design_id>\n\nContract design IDs can be referenced in your simba.json file under contracts_info -> contract name -> design_id. Contract design IDs can also be viewed by running:\n\n\t$ npx hardhat simba viewcontracts\n\n",
    viewContractsHelp: "\n\nThis command will return information pertaining to all contracts saved to your organisation on SIMBA Chain. Contract info includes: name, id, and version. For this command, just run:\n\n\t$ npx hardhat simba viewcontracts\n\n",
    cicdHelp: "\n\nFor CI/CD (continuous integration / continuous deployment) support in the Hardhat plugin, please see: https://www.npmjs.com/package/@simbachain/hardhat#continuous-integration-continuous-deployment\n\n",
    simbaInfoHelp: "\n\nThis command allows you to view info from your simba.json, as well as auth token (with token redacted) from authconfig.json. The command takes two optional parameters: 'field' and 'contract'. If you run the command without any parameters:\n\n\t$ npx hardhat simba simbainfo\n\nthen your simba.json will be printed in its entirety. For the 'field' parameter, you can either pass the exact name of a simba.json field (eg 'most_recent_deployment_info'), or you can pass one of the following abbreviations: 'org' for organisation info, 'app' for application info, 'deploy' for most recent deployment info, 'auth' for authProviderInfo, 'contracts' for all contracts (this would be the same as using the --contract all flag), 'web3' for web3Suite, 'baseurl' for 'baseURL', and 'authtoken' to retrieve info for your current auth credentials from authconfig.json. As an example, to retrieve most recent deployment info, you should run\n\n\t$ npx hardhat simba simbainfo --field deploy\n\nFor the 'contract' parameter, you can either pass the name of a contract, eg 'MyContract,' or you can pass 'all' to view info for all of your contracts in simba.json.contracts_info. An example of this call would be\n\n\t$ npx hardhat simba simbainfo --contract MyContract\n\n",
    getDirsHelp: "\n\nThis command will retrieve and print the current path to relevant directories in your project: 'artifacts', 'contracts', and 'build'. Simply run:\n\n\t$ npx hardhat simba getdirs\n\n",
    setDirHelp: "\n\nThis command allows the user to set the absolute directory path for a relevant directory in their project. Most users won't need this, but there may be cases in which you've changed your default directory for 'contracts', 'build', or 'artifacts'. This would be the case if you're using a Foundry project that has been integrated into a Hardhat project. To set a new directory path, pass the -dirname and -dirpath parameters. Valid values for dirname are 'contract', 'contracts', 'artifact', 'artifacts', and 'build'. Note that 'contract' and 'contracts' both refer to the directory named 'contracts'; and 'artifact' and 'artifacts' both refer to the directory named 'artifacts'. So for instance, to change the absolute directory path for 'build' to '/myhomedir/dev/myproject/build/', just run:\n\n\t$ npx hardhat simba setdir --dirname build --dirpath /myhomedir/dev/myproject/build/\n\nNote that if you pass 'reset' as --dirpath, then the path to the directory specified in --dirname will be reset to its default path.\n\n",
    resetDirHelp: "\n\nThis command allows the user to reset a directory path for 'build', 'contracts', or 'artifacts' to default settings for their project. To reset a directory path with this command, just pass --dirname, which can be any of 'build', 'contract', 'contracts', 'artifact', 'artifacts', or 'all'. Note that 'contract' and 'contracts' both refer to the directory named 'contracts'; and 'artifact' and 'artifacts' both refer to the directory named 'artifacts'. So for example, to reset the path to your 'artifacts' directory, just run:\n\n\t$ npx hardhat simba resetdir --dirname artifacts\n\nTo reset all three of 'contracts', 'build', and 'artifacts', run:\n\n\t$ npx hardhat simba resetdir --dirname all\n\n",
    deleteContractHelp: "\n\nThis command allows the user to delete contract designs from their organisation. This command can be run with an optional 'id' parameter to delete a single contract, or it can be run without any parameters, which will allow the user to choose from prompts which contract designs they want to delete. To run with the 'id' parameter:\n\n\t$ npx hardhat simba deletecontract --id <your contract design_id>\n\nTo run without parameters:\n\n\t$ npx hardhat simba deletecontract\n\n",
}

export default help;
