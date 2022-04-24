import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import login from "./login";
import exportContract from "./exportcontract";
import deployContract from "./deploycontract";
import logout from "./logout";


const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
};

const simba = async (hre: HardhatRuntimeEnvironment, cmd: string) => {
    switch(cmd) {
        case "login": { 
           await login(hre);
           break; 
        }
        case "export": {
            await exportContract(hre);
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
        default: { 
           console.log(`Please enter a valid simba command:\n${JSON.stringify(SIMBA_COMMANDS)}`);
           break; 
        } 
     } 
}

task("simba", "base simba cli that takes args")
    .addParam("cmd", "command to call through simba")
    .setAction(async (taskArgs, hre) => {
        const {cmd} = taskArgs;
        await simba(hre, cmd);
    });

export default simba;