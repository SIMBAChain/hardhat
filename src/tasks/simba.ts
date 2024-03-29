import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {default as chalk} from 'chalk';
import {login} from "./login";
import {exportContract} from "./exportcontract";
import {deployContract} from "./deploycontract";
import {logout} from "./logout";
import {help} from "./help";
import {getSimbaInfo} from "./simbainfo";
import {setOrGetDir} from "./dirs";
import {
    LogLevel,
    SimbaConfig,
    AllDirs,
} from '@simbachain/web3-suites';
import {setLogLevel} from "./loglevel";
import {
    viewContracts,
    pull,
    addLibrary,
    deleteContract,
 } from "./contract";

const SIMBA_COMMANDS = {
    login: "log in to Blocks using keycloak device login",
    export: "export your contract(s) to Blocks",
    deploy: "deploy your contract(s) to the blockchain using Blocks",
    logout: "logout of Blocks",
    loglevel: "set level for tslog logger",
    help: "get help for simba tasks",
    viewcontracts: "view contracts for your organisation",
    pull: "pull sol files and simba.json source code from SIMBA Chain",
    addlib: "add external library so you can deploy contracts that depend on that library",
    simbainfo: "grab info from your simba.json",
    setdir: "set directory. --dirpath can be either artifact, build, or contract",
    getdirs: "see readout of current directory paths for your project",
    resetdir: "reset directory path for 'build', 'artifact', or 'contract'",
    deletecontract: "delete contract"
};

enum Commands {
    LOGIN = "login",
    EXPORT = "export",
    DEPLOY = "deploy",
    LOGOUT = "logout",
    HELP = "help",
    LOGLEVEL = "loglevel",
    VIEWCONTRACTS = "viewcontracts",
    PULL = "pull",
    ADDLIB = "addlib",
    SIMBAINFO = "simbainfo",
    SETDIR = "setdir",
    GETDIRS = "getdirs",
    RESETDIR = "resetdir",
    DELETECONTRACT = "deletecontract",
};

/**
 * this is the main entry point for the CLI
 * cmd is the main command to call (eg deploy, export, etc.)
 * @param cmd 
 * @param topic 
 * @param primary 
 * @param deleteNonExportedArtifacts 
 * @param logLevel 
 * @param designID
 * @param libraryName
 * @param libraryAddress
 */
const simba = async (
    hre: HardhatRuntimeEnvironment,
    cmd: string,
    topic?: string,
    primary?: string,
    deleteNonExportedArtifacts?: string,
    logLevel?: LogLevel,
    designID?: string,
    libraryName?: string,
    libraryAddress?: string,
    interactive?: string,
    org?: string,
    app?: string,
    contractName?: string,
    pullSourceCode?: string,
    pullSolFiles?: string,
    useSimbaPath?: string,
    savemode?: string,
    field?: string,
    contract?: string,
    dirName?: string,
    dirPath?: string,
    ) => {
    const entryParams = {
        cmd,
        topic,
        primary,
        logLevel,
        designID,
        libraryName,
        libraryAddress,
        interactive,
        org,
        app,
        contractName,
        pullSourceCode,
        pullSolFiles,
        useSimbaPath,
        savemode,
        field,
        contract,
        dirName,
        dirPath,
    }
    SimbaConfig.log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    let _interactive: boolean = true;
    if (interactive) {
        interactive = interactive.toLowerCase();
        switch (interactive) {
            case "false": {
                _interactive = false;
                break;
            }
            case "true": {
                _interactive = true;
                break;
            }
            default: { 
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unrecognized value for "interactive" flag. Please enter '--interactive true' or '--interactive false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _interactive = true;
    }
    let _pullSourceCode: boolean = true;
    if (pullSourceCode) {
        pullSourceCode = pullSourceCode.toLowerCase();
        switch (pullSourceCode) {
            case "false": {
                _pullSourceCode = false;
                break;
            }
            case "true": {
                _pullSourceCode = true;
                break;
            }
            default: { 
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unrecognized value for "pullsourcecode" flag. Please enter '--pullsourcecode true' or '--pullsourcecode false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _pullSourceCode = true;
    }
    let _pullSolFiles: boolean = true;
    if (pullSolFiles) {
        pullSolFiles = pullSolFiles.toLowerCase();
        switch (pullSolFiles) {
            case "false": {
                _pullSolFiles = false;
                break;
            }
            case "true": {
                _pullSolFiles = true;
                break;
            }
            default: { 
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unrecognized value for "pullsolfiles" flag. Please enter '--pullsolfiles true' or '--pullsolfiles false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _pullSolFiles = false;
    }
    let _useSimbaPath: boolean = true;
    if (useSimbaPath) {
        useSimbaPath = useSimbaPath.toLowerCase();
        switch (useSimbaPath) {
            case "false": {
                _useSimbaPath = false;
                break;
            }
            case "true": {
                _useSimbaPath = true;
                break;
            }
            default: { 
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unrecognized value for "useSimbaPath" flag. Please enter '--useSimbaPath true' or '--useSimbaPath false' for this flag`)}`);
                return;
            } 
        }
    } else {
        _useSimbaPath = true;
    }
    if (savemode) {
        if (!(savemode === "new" || savemode === "update")) {
            SimbaConfig.log.error(`${chalk.redBright(`\nsimba: Invalid value for savemode: must be 'new' or 'update'`)}`);
            return;
        }
    } else {
        savemode = "new"
    }
    switch(cmd) {
        case Commands.LOGIN: { 
           await login(_interactive, org, app);
           break; 
        }
        case Commands.EXPORT: {
            await exportContract(hre, _interactive, primary, savemode);
            break;
        }
        case Commands.DEPLOY: {
            await deployContract(primary);
            break;
        }
        case Commands.LOGOUT: {
            await logout();
            break;
        }
        case Commands.HELP: {
            await help(topic);
            break;
        }
        case Commands.LOGLEVEL: {
            await setLogLevel(logLevel);
            break;
        }
        case Commands.VIEWCONTRACTS: {
            await viewContracts();
            break;
        }
        case Commands.PULL: {
            // we want non-interactive pull by default
            if (!interactive) {
                _interactive = false;
            }
            await pull(
                designID,
                contractName,
                _pullSourceCode,
                _pullSolFiles,
                _interactive,
                _useSimbaPath
            );
            break;
        }
        case Commands.ADDLIB: {
            await addLibrary(libraryName, libraryAddress);
            break;
        }
        case Commands.SIMBAINFO: {
            getSimbaInfo(field, contract);
            break;
        }
        case Commands.GETDIRS: {
            setOrGetDir("get");
            break;
        }
        case Commands.SETDIR: {
            if (!dirName || !dirPath) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: you must specify both dirname and dirpath`)}`);
                return;
            }
            if (dirName !== "contracts" && dirName !== "contract" && dirName !== "build" && dirName !== "artifact" && dirName !== "artifacts") {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname param must be one of "contract", "contracts", "build", "artifact", or "artifacts`)}`);
                return;
            }
            if (dirName === "contracts" || dirName === "contract") {
                dirName = AllDirs.CONTRACTDIRECTORY
            }
            if (dirName === "build") {
                dirName = AllDirs.BUILDDIRECTORY;
            }
            if (dirName === "artifact" || dirName === "artifacts") {
                dirName = AllDirs.ARTIFACTDIRECTORY;
            }
            setOrGetDir("set", dirName as AllDirs, dirPath);
            break;
        }
        case Commands.RESETDIR: {
            if (!dirName) {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname must be specified.`)}`)
                return;
            }
            if (dirName !== "contracts" && dirName !== "contract" && dirName !== "build" && dirName !== "artifact" && dirName !== "artifacts" && dirName !== "all") {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: dirname param must be one of "contract", "contracts", "build", "artifact", "artifacts"
                , or "all"`)}`);
                return;
            }
            if (dirName === "contracts" || dirName === "contract") {
                dirName = AllDirs.CONTRACTDIRECTORY
            }
            if (dirName === "build") {
                dirName = AllDirs.BUILDDIRECTORY;
            }
            if (dirName === "artifact" || dirName === "artifacts") {
                dirName = AllDirs.ARTIFACTDIRECTORY;
            }
            if (dirName.toLowerCase() === "all") {
                for (const value in AllDirs) {
                    setOrGetDir("set", (AllDirs as any)[value] as AllDirs, "reset");
                }
                return;
            }
            setOrGetDir("set", dirName as AllDirs, "reset");
            break;
        }
        case Commands.DELETECONTRACT: {
            await deleteContract(designID);
            break;
        }
        default: { 
           SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unrecognized command - Please enter a valid simba command:\n${chalk.cyanBright(`${JSON.stringify(SIMBA_COMMANDS)}`)}`)}`);
           break; 
        } 
     }
     SimbaConfig.log.debug(`:: EXIT :`);
}

task("simba", "base simba cli that takes args")
    .addPositionalParam("cmd", "command to call through simba")
    .addOptionalParam("topic", "pass optional help topic when cmd == 'help'")
    .addOptionalParam("prm", "used to specify a primary contract for either export or deploy")
    .addOptionalParam("lvl", "minimum log level to set your logger to")
    .addOptionalParam("id", "id of the contract you want to pull from Blocks; also used as id of contract for deletecontract")
    .addOptionalParam("libname", "name of the library you want to add")
    .addOptionalParam("libaddr", "address of the library you want to add")
    .addOptionalParam("interactive", "'true' or 'false' for interactive export, login, and pull")
    .addOptionalParam("org", "SIMBA org that you want to log into non-interactively")
    .addOptionalParam("app", "SIMBA app that you want to log into non-interactively")
    .addOptionalParam("contractname", "contract name for pull command")
    .addOptionalParam("pullsourcecode", "'true' or 'false' for whether or not source code should be pulled for simba.json. Defaults to 'true', and this should be the case, unless the user has a reason for not wanting to sync their simba.json")
    .addOptionalParam("pullsolfiles", "'true' or 'false' for whether user wants to sync their .sol files in their /contracts/ directory")
    .addOptionalParam("usesimbapath", "'true' if you want to pull contracts to contracts/SimbaImports/, defaults to 'true'")
    .addOptionalParam("savemode", "'new' to create save a new contract design, 'update' to update an existing one. Defaults to 'new'")
    .addOptionalParam("field", "field to print from simba.json")
    .addOptionalParam("contract", "contract to pull info for from simba.json. can be a contractName (without .sol) or 'all'")
    .addOptionalParam("dirname", "name of directory to set using setdir command")
    .addOptionalParam("dirpath", "can be either path to directory for setdir, or 'reset' to reset to default setting for directory")
    .setAction(async (taskArgs, hre) => {
        const {
            cmd,
            topic,
            prm,
            dltnon,
            lvl,
            id,
            libname,
            libaddr,
            interactive,
            org,
            app,
            contractname,
            pullsourcecode,
            pullsolfiles,
            usesimbapath,
            savemode,
            field,
            contract,
            dirname,
            dirpath,
        } = taskArgs;
        await simba(
            hre,
            cmd,
            topic,
            prm,
            dltnon,
            lvl,
            id,
            libname,
            libaddr,
            interactive,
            org,
            app,
            contractname,
            pullsourcecode,
            pullsolfiles,
            usesimbapath,
            savemode,
            field,
            contract,
            dirname,
            dirpath,
            );
    });

export default simba;
