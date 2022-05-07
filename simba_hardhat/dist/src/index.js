"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const path_1 = __importDefault(require("path"));
const simba_1 = __importDefault(require("./tasks/simba"));
require("./tasks/simba");
const login_1 = __importDefault(require("./tasks/login"));
require("./tasks/login");
const logout_1 = __importDefault(require("./tasks/logout"));
require("./tasks/logout");
const exportcontract_1 = __importDefault(require("./tasks/exportcontract"));
require("./tasks/exportcontract");
const deploycontract_1 = __importDefault(require("./tasks/deploycontract"));
require("./tasks/deploycontract");
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
require("./type-extensions");
config_1.extendConfig((config, userConfig) => {
    var _a;
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.
    const userPath = (_a = userConfig.paths) === null || _a === void 0 ? void 0 : _a.newPath;
    let newPath;
    if (userPath === undefined) {
        newPath = path_1.default.join(config.paths.root, "newPath");
    }
    else {
        if (path_1.default.isAbsolute(userPath)) {
            newPath = userPath;
        }
        else {
            // We resolve relative paths starting from the project's root.
            // Please keep this convention to avoid confusion.
            newPath = path_1.default.normalize(path_1.default.join(config.paths.root, userPath));
        }
    }
    config.paths.newPath = newPath;
});
config_1.extendEnvironment((hre) => {
    // We add a field to the Hardhat Runtime Environment here.
    // We use lazyObject to avoid initializing things until they are actually
    // needed.
    hre.simba = simba_1.default;
    hre.login = login_1.default;
    hre.logout = logout_1.default;
    hre.deploy = deploycontract_1.default;
    hre.export = exportcontract_1.default;
});
//# sourceMappingURL=index.js.map