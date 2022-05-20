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
 } from "./contract";

const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
    loglevel: "set level for tslog logger",
    help: "get help for simba tasks",
    viewcontracts: "view contracts for your organisation",
    sync: "pull contract from Blocks and sync in local project"
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
 */
const simba = async (
    hre: HardhatRuntimeEnvironment,
    cmd: string,
    topic?: string,
    primary?: string,
    deleteNonExportedArtifacts?: string,
    logLevel?: LogLevel,
    designID?: string,
    ) => {
    const entryParams = {
        cmd,
        topic,
        primary,
        deleteNonExportedArtifacts,
    }
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    switch(cmd) {
        case Commands.LOGIN: { 
           await login(hre);
           break; 
        }
        case Commands.EXPORT: {
            let _deleteNonExportedArtifacts = true;
            if (deleteNonExportedArtifacts === "false") {
                _deleteNonExportedArtifacts = false;
            }
            await exportContract(hre, primary, _deleteNonExportedArtifacts);
            break;
        }
        case Commands.DEPLOY: {
            await deployContract(hre);
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
            if (!designID) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: you must pass a designID to sync a contract`)}`);
                break;
            }
            await sync(hre, designID)
            break;
        }
        default: { 
           console.log(`Please enter a valid simba command:\n${JSON.stringify(SIMBA_COMMANDS)}`);
           break; 
        } 
     }
     SimbaConfig.log.debug(`:: EXIT :`);
}

task("simba", "base simba cli that takes args")
    .addPositionalParam("cmd", "command to call through simba")
    .addOptionalParam("topic", "pass optional help topic when cmd == 'help'")
    .addOptionalParam("prm", "used to specify a primary artifact when exporting export")
    .addOptionalParam("dltnon", "set to 'false' if exporting more than one contract simultaneously")
    .addOptionalParam("lvl", "minimum log level to set your logger to")
    .addOptionalParam("id", "id of the contract you want to sync from Blocks")
    .setAction(async (taskArgs, hre) => {
        const {cmd, topic, prm, dltnon, lvl, id} = taskArgs;
        await simba(hre, cmd, topic, prm, dltnon, lvl, id);
    });

export default simba;