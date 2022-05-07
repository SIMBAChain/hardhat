"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const login = async (hre) => {
    web3_suites_1.log.debug(`:: ENTER :`);
    const simbaConfig = new web3_suites_1.SimbaConfig();
    const org = await (0, web3_suites_1.chooseOrganisationFromList)(simbaConfig);
    if (!org) {
        return Promise.resolve(new Error('No Organisation Selected!'));
    }
    const app = await (0, web3_suites_1.chooseApplicationFromList)(simbaConfig);
    if (!app) {
        return Promise.resolve(new Error('No Application Selected!'));
    }
    web3_suites_1.log.info(`${chalk_1.default.cyanBright('\nsimba: Logged in with organisation')} ${chalk_1.default.greenBright(org.display_name)} ${chalk_1.default.cyanBright('and application')} ${chalk_1.default.greenBright(app.display_name)}`);
};
(0, config_1.task)("login", "keycloak device and blocks login")
    .setAction(async (hre) => {
    await login(hre);
});
exports.default = login;
//# sourceMappingURL=login.js.map