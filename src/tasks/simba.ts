import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
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

const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
    loglevel: "set level for tslog logger",
};

enum Commands {
    LOGIN = "login",
    EXPORT = "export",
    DEPLOY = "deploy",
    LOGOUT = "logout",
    HELP = "help",
    LOGLEVEL = "loglevel",
};

const simba = async (
    hre: HardhatRuntimeEnvironment,
    cmd: string,
    helpTopic?: string,
    primary?: string,
    deleteNonExportedArtifacts?: string,
    logLevel?: LogLevel,
    ) => {
    const entryParams = {
        cmd,
        helpTopic,
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
            await help(hre, helpTopic);
            break;
        }
        case Commands.LOGLEVEL: {
            await setLogLevel(hre, logLevel);
            break;
        }
        default: { 
           console.log(`Please enter a valid simba command:\n${JSON.stringify(SIMBA_COMMANDS)}`);
           break; 
        } 
     } 
}

task("simba", "base simba cli that takes args")
    .addPositionalParam("cmd", "command to call through simba")
    .addOptionalPositionalParam("helpTopic", "pass optional help topic when cmd == 'help'")
    .addOptionalParam("prm", "used to specify a primary artifact when exporting export")
    .addOptionalParam("dltnon", "set to 'false' if exporting more than one contract simultaneously")
    .addOptionalParam("lvl", "minimum log level to set your logger to")
    .setAction(async (taskArgs, hre) => {
        const {cmd, helpTopic, prm, dltnon, lvl} = taskArgs;
        await simba(hre, cmd, helpTopic, prm, dltnon, lvl);
    });

export default simba;