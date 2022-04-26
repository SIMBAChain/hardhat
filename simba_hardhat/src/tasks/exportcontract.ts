import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as path from 'path';
const fsPromises = require("fs").promises;
import {
    Logger,
} from "tslog";
const log: Logger = new Logger();
import {SimbaConfig} from './lib';
import {default as chalk} from 'chalk';
import {default as prompt} from 'prompts';
import { StatusCodeError } from 'request-promise/errors';

async function walkDirForContracts(
    dir: string,
    extension: string,
): Promise<string[]> {
    let files: string[] = [];
    try {
        const entries = fsPromises.readdir(dir);
        for (const entry of entries) {
            if (entry.isFile()) {
                const filePath = path.join(dir, entry.name);
                if (!extension || (extension && path.parse(filePath).ext === extension)) {
                    files.push(filePath);
                }
            } else if (entry.isDirectory()) {
                try {
                    const subFiles = await walkDirForContracts(path.join(dir, entry.name), extension);
                    files = files.concat(subFiles);
                } catch (err) {
                    log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
                }
            }
        }
    } catch (err) {
        log.debug(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
    }
    return files;
}

const exportContract = async (hre: HardhatRuntimeEnvironment) => {
    console.log("running exportContract");
}

task("export", "export contract(s) to Blocks")
    .setAction(async (hre) => {
        await exportContract(hre);
    });

export default exportContract;