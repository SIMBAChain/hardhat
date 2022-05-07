import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import login from "./login";
import exportContract from "./exportcontract";
import deployContract from "./deploycontract";
import logout from "./logout";
import help from "./help";
import {
    log,
} from '@simbachain/web3-suites/dist/lib';

const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
};

const simba = async (
    hre: HardhatRuntimeEnvironment,
    cmd: string,
    helpTopic?: string,
    primary?: string,
    deleteNonExportedArtifacts?: string,
    ) => {
    const entryParams = {
        cmd,
        helpTopic,
        primary,
        deleteNonExportedArtifacts,
    }
    log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    switch(cmd) {
        case "login": { 
           await login(hre);
           break; 
        }
        case "export": {
            let _deleteNonExportedArtifacts = true;
            if (deleteNonExportedArtifacts === "false") {
                _deleteNonExportedArtifacts = false;
            }
            await exportContract(hre, primary, _deleteNonExportedArtifacts);
            break;
        }
        case "deploy": {
            await deployContract(hre);
            break;
        }
        case "logout": {
            await logout(hre);
            break;
        }
        case "help": {
            await help(hre, helpTopic);
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
    .setAction(async (taskArgs, hre) => {
        const {cmd, helpTopic, prm, dltnon} = taskArgs;
        await simba(hre, cmd, helpTopic, prm, dltnon);
    });

export default simba;