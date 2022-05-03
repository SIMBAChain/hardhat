
import {
    task,
} from "hardhat/config";
import {
    HardhatRuntimeEnvironment,
} from "hardhat/types";
import {
    chooseApplicationFromList,
    chooseOrganisationFromList,
    SimbaConfig,
    log,
} from "./lib";

const login = async (hre: HardhatRuntimeEnvironment): Promise<void | Error> => {
    log.debug(`:: ENTER :`);
    const simbaConfig = new SimbaConfig();
    const org = await chooseOrganisationFromList(simbaConfig);
    if (!org) {
        return Promise.resolve(new Error('No Organisation Selected!'));
    }
    const app = await chooseApplicationFromList(simbaConfig);
    if (!app) {
        return Promise.resolve(new Error('No Application Selected!'));
    }
    log.info(`Logged in with organisation ${org.display_name} and application ${app.display_name}`);
}

task("login", "keycloak device and blocks login")
    .setAction(async (hre) => {
        await login(hre);
    });

export default login;