import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployContract = async (hre: HardhatRuntimeEnvironment) => {
    console.log("running deployContract");
}

task("deploy", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await deployContract(hre);
    });

export default deployContract;