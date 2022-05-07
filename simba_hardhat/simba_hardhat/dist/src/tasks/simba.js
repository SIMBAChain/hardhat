"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const login_1 = __importDefault(require("./login"));
const exportcontract_1 = __importDefault(require("./exportcontract"));
const deploycontract_1 = __importDefault(require("./deploycontract"));
const logout_1 = __importDefault(require("./logout"));
const help_1 = __importDefault(require("./help"));
const web3_suites_1 = require("@simbachain/web3-suites");
const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
};
const simba = async (hre, cmd, helpTopic, primary, deleteNonExportedArtifacts) => {
    const entryParams = {
        cmd,
        helpTopic,
        primary,
        deleteNonExportedArtifacts,
    };
    web3_suites_1.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    switch (cmd) {
        case "login": {
            await (0, login_1.default)(hre);
            break;
        }
        case "export": {
            let _deleteNonExportedArtifacts = true;
            if (deleteNonExportedArtifacts === "false") {
                _deleteNonExportedArtifacts = false;
            }
            await (0, exportcontract_1.default)(hre, primary, _deleteNonExportedArtifacts);
            break;
        }
        case "deploy": {
            await (0, deploycontract_1.default)(hre);
            break;
        }
        case "logout": {
            await (0, logout_1.default)(hre);
            break;
        }
        case "help": {
            await (0, help_1.default)(hre, helpTopic);
            break;
        }
        default: {
            console.log(`Please enter a valid simba command:\n${JSON.stringify(SIMBA_COMMANDS)}`);
            break;
        }
    }
};
(0, config_1.task)("simba", "base simba cli that takes args")
    .addPositionalParam("cmd", "command to call through simba")
    .addOptionalPositionalParam("helpTopic", "pass optional help topic when cmd == 'help'")
    .addOptionalParam("prm", "used to specify a primary artifact when exporting export")
    .addOptionalParam("dltnon", "set to 'false' if exporting more than one contract simultaneously")
    .setAction(async (taskArgs, hre) => {
    const { cmd, helpTopic, prm, dltnon } = taskArgs;
    await simba(hre, cmd, helpTopic, prm, dltnon);
});
exports.default = simba;
//# sourceMappingURL=simba.js.map