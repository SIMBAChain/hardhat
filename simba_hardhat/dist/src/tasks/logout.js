"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const web3_suites_1 = require("@simbachain/web3-suites");
const chalk_1 = __importDefault(require("chalk"));
const logout = async (hre) => {
    web3_suites_1.log.debug(`:: ENTER :`);
    await web3_suites_1.SimbaConfig.authStore.logout();
    web3_suites_1.log.info(`${chalk_1.default.cyanBright(`\nsimba: you have logged out.`)}`);
    web3_suites_1.log.debug(`:: EXIT :`);
};
config_1.task("logout", "export contract(s) to Blocks")
    .setAction(async (hre) => {
    await logout(hre);
});
exports.default = logout;
//# sourceMappingURL=logout.js.map