import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const logout = async (hre: HardhatRuntimeEnvironment) => {
    console.log("running logout");
}

task("logout", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await logout(hre);
    });

export default logout;