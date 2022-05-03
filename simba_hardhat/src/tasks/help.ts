import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { log } from "./lib";

export async function help(
    hre: HardhatRuntimeEnvironment,
    topic?: string,
) {
    if (topic) {
        log.debug(`topic: ${topic}`);
    } else {
        log.debug(`no topic`);
    }
}

task("help", "export contract(s) to Blocks")
.setAction(async (hre) => {
    await help(hre);
});

export default help;