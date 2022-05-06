import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as path from 'path';
import * as fs from "fs";
import {
    SimbaConfig,
    log,
} from './lib';
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import { StatusCodeError } from 'request-promise/errors';
import {
    writeAndReturnASTSourceAndCompiler,
} from "./lib/api"
import {
    promisifiedReadFile,
    walkDirForContracts,
} from "./lib";

interface Data {
    [key: string]: any;
}

interface Request {
    id: string;
    version: string;
    primary: string;
    import_data: Data;
}

// async function walkDirForContracts(
//     dir: string,
//     extension: string,
// ): Promise<string[] | any> {
//     let files: string[] = [];
//     let isSolDirectoryName = true;
//     try {
//         const entries = await fsPromises.readdir(dir);
//         log.debug(`:: directory entries : ${JSON.stringify(entries)}`);
//         for (const entry of entries) {
//             if (entry.endsWith(".sol")) {
//                 isSolDirectoryName = true;
//             }
//             if (entry.isFile() || !isSolDirectoryName) {
//                 const filePath = path.join(dir, entry.name);
//                 console.log(`filePath: ${filePath}`);
//                 if (!extension || (extension && path.parse(filePath).ext === extension)) {
//                     files.push(filePath);
//                 }
//             } else if (entry.isDirectory()) {
//                 try {
//                     const subFiles = await walkDirForContracts(path.join(dir, entry.name), extension);
//                     files = files.concat(subFiles);
//                 } catch (err) {
//                     log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
//                     return err as any;
//                 }
//             }
//         }
//     } catch (err) {
//         log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
//         return err as any;
//     }
//     return files;
// }


// async function asyncReadFile(
//     filePath: fs.PathLike,
//     options: { encoding?: null; flag?: string },
// ): Promise<Buffer | Error | void> {
//     try {
//         const data = await fsPromises.readFile(filePath, options);
//         return data;
//     } catch (err) {
//         log.error(`:: EXTI : ERROR : ${JSON.stringify(err)}`);
//         return err as any;
//     }
// }

const exportContract = async (
    hre: HardhatRuntimeEnvironment,
    primary?: string,
    deleteNonExportedArtifacts: boolean = true,
) => {
    const entryParams = {
        primary,
        deleteNonExportedArtifacts,
    };
    log.debug(`:: ENTER : ${JSON.stringify(entryParams)}`);
    // Not putting any "isLoggedIn()" logic here because SimbaConfig.authStore.doGetRequest handles that
    const buildDir = SimbaConfig.buildDirectory;
    let files: string[] = [];

    try {
        files = await walkDirForContracts(buildDir, '.json');
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            log.error(`:: EXIT : ERROR : Simba was not able to find any build artifacts.\nDid you forget to run: "npx hardhat compile" ?\n`);
            return;
        }
        log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
        return;
    }

    const choices = [];
    const importData: Data = {};
    const contractNames = [];

    for (const file of files) {
        if (file.endsWith('Migrations.json') || file.endsWith('dbg.json')) {
            continue;
        }
        log.info(`${chalk.green('simba export: ')}- ${file}`);
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        if (!(buf instanceof Buffer)) {
            continue;
        }
        const parsed = JSON.parse(buf.toString());
        const name = parsed.contractName;
        const contractSourceName = parsed.sourceName;
        const _astSourceAndCompiler = await writeAndReturnASTSourceAndCompiler(name, contractSourceName);
        contractNames.push(name);
        importData[name] = JSON.parse(buf.toString());
        importData[name].ast = _astSourceAndCompiler.ast;
        importData[name].source = _astSourceAndCompiler.source;
        importData[name].compiler = {'name': 'solc', 'version': _astSourceAndCompiler.compiler}

        choices.push({title: name, value: name});
    }

    if (primary) {
        if ((primary as string) in importData) {
            SimbaConfig.ProjectConfigStore.set('primary', primary);
        } else {
            log.error(`:: EXIT : ERROR : Primary contract ${primary} is not the name of a contract in this project`);
            return;
        }
    } else {
        const chosen = await prompt({
            type: 'select',
            name: 'contract',
            message: 'Please select your primary contract',
            choices,
        });

        if (!chosen.contract) {
            log.error(`:: EXIT : ERROR : No primary contract chosen!`);
            return;
        }

        SimbaConfig.ProjectConfigStore.set('primary', chosen.contract);
    }

    // if (!SimbaConfig.ProjectConfigStore.has("primary")) {

    // }

    // after the above code runs, go through importData and remove info for all contracts not pertaining to primary
    if (deleteNonExportedArtifacts) {
        const primaryName = SimbaConfig.ProjectConfigStore.get('primary');
        for (let i = 0; i < contractNames.length; i++) {
            const contractName = contractNames[i];
            if (contractName !== primaryName) {
                delete importData[contractName];
            }
        }
    }

    log.debug(`importData: ${JSON.stringify(importData)}`);

    const request = {
        version: '0.0.2',
        primary: SimbaConfig.ProjectConfigStore.get('primary'),
        import_data: importData,
    };

    log.info(`${chalk.cyanBright('simba: Sending to SIMBA Chain SCaaS')}`);

    try {
        const resp = await SimbaConfig.authStore.doPostRequest(
            `organisations/${SimbaConfig.organisation.id}/contract_designs/import/truffle/`,
            request,
            "application/json",
            true,
        );
        SimbaConfig.ProjectConfigStore.set('design_id', resp.id);
        if (resp.id) {
            log.info(`${chalk.cyanBright('simba: ')}${chalk.greenBright(`Saved to Contract Design ID ${resp.id}`)}`);
        } else {
            log.error(`${chalk.red('simba: ')}Error exporting contract to SIMBA Chain`);
        }
    } catch (e) {
        if (e instanceof StatusCodeError) {
            if('errors' in e.error && Array.isArray(e.error.errors)){
                e.error.errors.forEach((error: any)=>{
                    log.error(
                        `${chalk.red('simba export: ')}[STATUS:${
                            error.status
                        }|CODE:${
                            error.code
                        }] Error Saving contract ${
                            error.title
                        } - ${error.detail}`,
                    );
                });
            } else {
                log.error(
                    `${chalk.red('simba export: ')}[STATUS:${
                        e.error.errors[0].status
                    }|CODE:${
                        e.error.errors[0].code
                    }] Error Saving contract ${
                        e.error.errors[0].title
                    } - ${e.error.errors[0].detail}`,
                );
            }

            return Promise.resolve();
        }
        const err = e as any;
        if ('errors' in err) {
            if (Array.isArray(err.errors)) {
                log.error(
                    `${chalk.red('simba export: ')}[STATUS:${err.errors[0].status}|CODE:${
                        err.errors[0].code
                    }] Error Saving contract ${err.errors[0].detail}`,
                );
                return Promise.resolve();
            }
        }
        return;
    }
}

task("export", "export contract(s) to Blocks")
    .setAction(async (taskArgs, hre) => {
        const {primary, deleteNonExportedArtifacts} = taskArgs;
        await exportContract(hre, primary, deleteNonExportedArtifacts);
    });

export default exportContract;