/*
NOTE:
this file will actually come from the standalone web3 repo
it is just included here for now for testing purposes
*/
import {
    Logger,
} from "tslog";
const log: Logger = new Logger();
import {default as prompt} from 'prompts';
import {
    SimbaConfig,
} from "../lib";
import {
    promisifiedReadFile,
    walkDirForContracts,
} from "../exportcontract";
import * as fs from "fs";
interface Dictionary<T> {
    [Key: string]: T;
}

interface Choice {
    title: string;
    value: string;
}

interface Response {
    next: string;
    prev: string;
    data: Dictionary<any>;
}

interface ASTSourceAndCompiler {
    ast: Record<any, any>;
    source: Record<any, any>;
    compiler: string;
}

const getList = async (config: SimbaConfig, url?: string): Promise<any> => {
    if (!url) {
        url = 'v2/organisations/';
    }
    try {
        const res = config.authStore.doGetRequest(url);
        return res;
    } catch (e) {
        const err = e as any;
        log.info(`err from getList : ${JSON.stringify(err)}`);
        if (err.message === "Request failed with status code 500") {
            log.info(`:: Auth token expired, please log in again`);
            SimbaConfig.authStore.logout();
            await SimbaConfig.authStore.loginAndGetAuthToken();
        }
    }
};

export const chooseOrganisationFromList = async (config: SimbaConfig, url?: string): Promise<any> => {
    log.debug(`:: ENTER : ${JSON.stringify(config)}`);
    if (!url) {
        url = 'organisations/';
    }
    const orgResponse = await getList(config, url);

    const orgs: Response = {
        next: orgResponse.next,
        prev: orgResponse.prev,
        data: orgResponse.results.reduce((map: Dictionary<object>, obj: any) => {
            const data = {...obj, id: obj.id};
            map[data.name] = data;
            return map;
        }, {}),
    };

    const choices = [];
    if (orgs.prev) {
        choices.push({
            title: '<-',
            description: 'Previous choices',
            value: 'prev'
        });
    }

    if (orgs.next) {
        choices.push({title: '->', description: 'Next choices', value: 'next'});
    }

    for (const [key, val] of Object.entries(orgs.data)) {
        choices.push({title: key, value: val});
    }

    const response = await prompt({
        type: 'select',
        name: 'organisation',
        message: 'Please pick an organisation',
        choices,
    });

    if (response.organisation === 'prev') {
        return chooseOrganisationFromList(config, orgs.prev);
    } else if (response.organisation === 'next') {
        return chooseOrganisationFromList(config, orgs.next);
    }

    if (!response.organisation) {
        throw new Error('No Organisation Selected!');
    }
    
    config.organisation = response.organisation;

    return response.organisation;
};

export async function chooseOrganisationFromInput(
    config: SimbaConfig,
    url?: string,
): Promise<any> {
    console.error("needs to be implemented");
}

function parseBuildInfoJsonName(
    location: string,
): string {
    if (location.includes("/")) {
        const idArr = location.split("/");
        const jsonName = idArr[idArr.length-1];
        return jsonName;
    } else {
        return location;
    }
}

async function buildInfoJsonName(
    contractName: string,
): Promise<string> {
    const buildDir = SimbaConfig.buildDirectory;
    let files: string[] = [];
    try {
        files = await walkDirForContracts(buildDir, ".json");
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            log.error(`:: EXIT : ERROR : Simba was not able to find any build info artifacts.\nDid you forget to run: "npx hardhat compile" ?\n`);
            return "";
        }
        log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
        return "";
    }
    for (const file of files) {
        if (!(file.endsWith(`${contractName}.dbg.json`))) {
            continue;
        } else {
            const buf = await promisifiedReadFile(file, {flag: 'r'});
            const parsed = JSON.parse(buf.toString());
            const location = parsed.buildInfo;
            const jsonName = parseBuildInfoJsonName(location);
            return jsonName;
        }
    }
    log.error(`:: EXIT : ERROR : no info found for contract`);
    return "";
}

async function astSourceAndCompiler(
    contractName: string,
    contractSourceName: string,
    _buildInfoJsonName: string,
): Promise<ASTSourceAndCompiler> {
    const params = {
        contractName,
        _buildInfoJsonName,
    };
    log.debug(`:: ENTER : ${JSON.stringify(params)}`);
    const buildInfoDir = SimbaConfig.buildInfoDirectory;
    log.debug(`:: buildInfoDir : ${buildInfoDir}`);
    let files: string[] = [];

    let astAndSourceAndCompiler: ASTSourceAndCompiler = {
        "ast": {},
        "source": {},
        "compiler": "",
    };

    try {
        files = await walkDirForContracts(buildInfoDir, ".json");
        log.debug(`:: files : ${JSON.stringify(files)}`);
    } catch (e) {
        const err = e as any;
        if (err.code === 'ENOENT') {
            log.error(`:: EXIT : ERROR : Simba was not able to find any build info artifacts.\nDid you forget to run: "npx hardhat compile" ?\n`);
            return astAndSourceAndCompiler;
        }
        log.error(`:: EXIT : ERROR : ${JSON.stringify(err)}`);
        return astAndSourceAndCompiler;
    }

    for (const file of files) {
        if (!(file.endsWith(_buildInfoJsonName))) {
            continue;
        } else {
            // here we should actually be taking
            // the sourceName from the artifact
            // because 
            // const contractNameWSol = contractName.endsWith(".sol") ? contractName : contractName + ".sol";
            const buf = await promisifiedReadFile(file, {flag: 'r'});
            const parsed = JSON.parse(buf.toString());
            const output = parsed.output;
            const outputSources = output.sources;
            const outputContractSource = outputSources[contractSourceName];
            const ast = outputContractSource.ast;
            astAndSourceAndCompiler.ast = ast;

            const solcVersion = parsed.solcVersion;
            astAndSourceAndCompiler.compiler = solcVersion;

            const input = parsed.input;
            const inputSources = input.sources;
            const inputContractSource = inputSources[contractSourceName];
            const contractSourceCode = inputContractSource.content;
            astAndSourceAndCompiler.source = contractSourceCode;
            return astAndSourceAndCompiler;
        }
    }
    log.error(`:: EXIT : ERROR : no contract info found`);
    return astAndSourceAndCompiler;
}

export async function writeAndReturnASTSourceAndCompiler(
    contractName: string,
    contractSourceName: string,
): Promise<ASTSourceAndCompiler> {
    const _astSourceAndCompiler = await getASTSourceAndCompiler(
        contractName,
        contractSourceName,
        ) as ASTSourceAndCompiler;
    const buildDir = SimbaConfig.buildDirectory;
    const sourceFileName = contractSourceName.split("/")[1];
    const filePath = `${buildDir}/${sourceFileName}/${contractName}.json`;
    const files = await walkDirForContracts(buildDir, ".json");
    for (const file of files) {
        if (!(file.endsWith(`${contractName}.json`))) {
            continue;
        }
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        const parsed = JSON.parse(buf.toString());
        parsed.ast = _astSourceAndCompiler.ast;
        parsed.source = _astSourceAndCompiler.source;
        const data = JSON.stringify(parsed);
        log.debug(`:: writing to ${filePath}`);
        fs.writeFileSync(filePath, data);
        return _astSourceAndCompiler;
    }
    return _astSourceAndCompiler;
}

async function getASTSourceAndCompiler(
    contractName: string,
    contractSourceName: string,
): Promise<ASTSourceAndCompiler | Error> {
    const _buildInfoJsonName = await buildInfoJsonName(contractName);
    const _astAndSourceAndCompiler = await astSourceAndCompiler(
        contractName,
        contractSourceName,
        _buildInfoJsonName,
    );
    if (_astAndSourceAndCompiler.ast === {}) {
        const message = `no ast found for ${contractName}`;
        log.error(`:: EXIT : ERROR : ${message}`);
        return new Error(`${message}`);
    }
    return _astAndSourceAndCompiler;
}

export async function getApp(config: SimbaConfig,
    id: string,
): Promise<any> {
    const url = `organisations/${config.organisation.id}/applications/${id}`;
    const response = await config.authStore.doGetRequest(url, 'application/json');
    return response;
};

export async function chooseApplicationFromList(
    config: SimbaConfig,
    url?: string,
): Promise<any> {
    if (!url) {
        url = `organisations/${config.organisation.id}/applications/`;
    }

    const appResponse = await getList(config, url);

    const apps: Response = {
        next: appResponse.next,
        prev: appResponse.prev,
        data: appResponse.results.reduce((map: Dictionary<object>, obj: any) => {
            const data = {...obj, id: obj.id};
            map[data.display_name] = data;
            return map;
        }, {}),
    };

    const choices = [];
    if (apps.prev) {
        choices.push({
            title: '<-',
            description: 'Previous choices',
            value: 'prev'
        });
    }

    if (apps.next) {
        choices.push({title: '->', description: 'Next choices', value: 'next'});
    }

    for (const [key, val] of Object.entries(apps.data)) {
        choices.push({title: key, value: val});
    }

    const response = await prompt({
        type: 'select',
        name: 'application',
        message: 'Please pick an application',
        choices,
    });

    if (response.application === 'prev') {
        return chooseApplicationFromList(config, apps.prev);
    } else if (response.application === 'next') {
        return chooseApplicationFromList(config, apps.next);
    }

    if (!response.application) {
        throw new Error('No Application Selected!');
    }
    config.application = response.application;

    return response.application;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getBlockchains(
    config: SimbaConfig,
    url?: string,
): Promise<any> {
    if (!url) {
        url = `organisations/${config.organisation.id}/blockchains/`;
    }

    const chains: any = await getList(config, url);
    const choices: Choice[] = [];

    chains.results.forEach((chain: any) => {
        choices.push({
            title: chain.display_name,
            value: chain.name,
        });
    });

    return choices;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getStorages(
    config: SimbaConfig,
    url?: string,
): Promise<any> {
    if (!url) {
        url = `organisations/${config.organisation.id}/storage/`;
    }

    const storages: any = await getList(config, url);
    const choices: Choice[] = [];

    storages.results.forEach((storage: any) => {
        choices.push({
            title: storage.display_name,
            value: storage.name,
        });
    });

    return choices;
};

async function getABIForPrimaryContract(
) {
    const contractName = SimbaConfig.ProjectConfigStore.get("primary");
    if (!contractName) {
        log.error(`:: EXIT : ERROR : no primary contract in simba.json`);
        return "";
    }
    const buildDir = SimbaConfig.buildDirectory;
    const files = await walkDirForContracts(buildDir, ".json");
    for (const file of files) {
        if (!(file.endsWith(`${contractName}.json`))) {
            continue;
        }
        const buf = await promisifiedReadFile(file, {flag: 'r'});
        const parsed = JSON.parse(buf.toString());
        const abi = parsed.abi;
        log.debug(`:: contract ABI : ${JSON.stringify(abi)}`);
        return abi;
    }
}

export async function getFieldFromPrimaryContractABI(
    name: string,
) {
    const abi = await getABIForPrimaryContract();
    for (let i = 0; i < abi.length; i++) {
        const entry = abi[i];
        if (entry.name === name) {
            return entry;
        }
    }
    return {};
}

async function primaryContractConstructor() {
    const abi = await getABIForPrimaryContract();
    for (let i = 0; i < abi.length; i++) {
        const entry = abi[i];
        if (entry.type === "constructor") {
            log.debug(`:: constructor : ${JSON.stringify(entry)}`);
            return entry;
        }
    }
    return {};
}

export async function primaryConstructorRequiresArgs(): Promise<boolean> {
    const constructor = await primaryContractConstructor();
    const inputs = constructor.inputs;
    let requiresArgs = false;
    if (inputs && inputs.length > 0) {
        requiresArgs = true;
    }
    log.debug(`:: requiresArgs : ${requiresArgs}`);
    return requiresArgs;
}