import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const exportContract = async (hre: HardhatRuntimeEnvironment) => {
    console.log("running exportContract");
}

task("export", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await exportContract(hre);
    });

export default exportContract;