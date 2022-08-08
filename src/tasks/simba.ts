import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {default as chalk} from 'chalk';
import login from "./login";
import exportContract from "./exportcontract";
import deployContract from "./deploycontract";
import logout from "./logout";
import help from "./help";
import {
    LogLevel,
    SimbaConfig,
} from '@simbachain/web3-suites';
import setLogLevel from "./loglevel";
import {
    viewContracts,
    sync,
    addLib,
 } from "./contract";

const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
    loglevel: "set level for tslog logger",
    help: "get help for simba tasks",
    viewcontracts: "view contracts for your organisation",
    sync: "pull contract from Blocks and sync in local project",
    addlib: "add external library so you can deploy contracts that depend on that library"
};

enum Commands {
    LOGIN = "login",
    EXPORT = "export",
    DEPLOY = "deploy",
    LOGOUT = "logout",
    HELP = "help",
    LOGLEVEL = "loglevel",
    VIEWCONTRACTS = "viewcontracts",
    SYNC = "sync",
    ADDLIB = "addlib",
};

/**
 * this is the main entry point for the CLI
 * cmd is the main command to call (eg deploy, export, etc.)
 * @param hre 
 * @param cmd 
 * @param topic 
 * @param primary 
 * @param deleteNonExportedArtifacts 
 * @param logLevel 
 * @param designID
 * @param libraryName
 * @param libraryAddress
 */
const simba = async (
    hre: HardhatRuntimeEnvironment,
    cmd: string,
    topic?: string,
    primary?: string,
    deleteNonExportedArtifacts?: string,
    logLevel?: LogLevel,
    designID?: string,
    libraryName?: string,
    libraryAddress?: string,
    interactive?: string,
    org?: string,
    app?: string,
    ) => {
    const entryParams = {
        cmd,
        topic,
        primary,
        logLevel,
        designID,
        libraryName,
        libraryAddress,
        interactive,
        org,
        app,
    }
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    let _interactive: boolean = true;
    if (interactive) {
        interactive = interactive.toLowerCase();
        switch (interactive) {
            case "false": {
                _interactive = false;
                break;
            }
            case "true": {
                _interactive = true;
                break;
            }
            default: { 
                console.log(`${chalk.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _interactive = true;
    }
    switch(cmd) {
        case Commands.LOGIN: { 
           await login(hre, _interactive, org, app);
           break; 
        }
        case Commands.EXPORT: {
            await exportContract(hre, _interactive, primary);
            break;
        }
        case Commands.DEPLOY: {
            await deployContract(hre, primary);
            break;
        }
        case Commands.LOGOUT: {
            await logout(hre);
            break;
        }
        case Commands.HELP: {
            await help(hre, topic);
            break;
        }
        case Commands.LOGLEVEL: {
            await setLogLevel(hre, logLevel);
            break;
        }
        case Commands.VIEWCONTRACTS: {
            await viewContracts(hre);
            break;
        }
        case Commands.SYNC: {
            await sync(hre, designID)
            break;
        }
        case Commands.ADDLIB: {
            await addLib(hre, libraryName, libraryAddress);
            break;
        }
        default: { 
           console.log(`${chalk.redBright(`\nsimba: unrecognized command - Please enter a valid simba command:\n${chalk.cyanBright(`${JSON.stringify(SIMBA_COMMANDS)}`)}`)}`);
           break; 
        } 
     }
     SimbaConfig.log.debug(`:: EXIT :`);
}

task("simba", "base simba cli that takes args")
    .addPositionalParam("cmd", "command to call through simba")
    .addOptionalParam("topic", "pass optional help topic when cmd == 'help'")
    .addOptionalParam("prm", "used to specify a primary contract for either export or deploy")
    .addOptionalParam("lvl", "minimum log level to set your logger to")
    .addOptionalParam("id", "id of the contract you want to sync from Blocks")
    .addOptionalParam("libname", "name of the library you want to add")
    .addOptionalParam("libaddr", "address of the library you want to add")
    .addOptionalParam("interactive", "'true' or 'false' for interactive export")
    .addOptionalParam("org", "SIMBA org that you want to log into non-interactively")
    .addOptionalParam("app", "SIMBA app that you want to log into non-interactively")
    .setAction(async (taskArgs, hre) => {
        const {cmd, topic, prm, dltnon, lvl, id, libname, libaddr, interactive, org, app} = taskArgs;
        await simba(hre, cmd, topic, prm, dltnon, lvl, id, libname, libaddr, interactive, org, app);
    });

export default simba;