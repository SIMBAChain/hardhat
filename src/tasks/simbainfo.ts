import {
    SimbaConfig,
    SimbaInfo,
} from '@simbachain/web3-suites';
// const log: Logger = new Logger({minLevel: "error"});
import {default as chalk} from 'chalk';

enum SimbaJsonFields {
    ALL = "all",
    ORG = "org",
    APP = "app",
    DEPLOY = "deploy",
    AUTH = "auth",
    CONTRACTS = "contracts",
    W3 = "web3",
    BASEURL = "baseurl",
    AUTHTOKEN = "authtoken",
}

/**
 * set minimum log level for logger
 * @param field
 * @param contract 
 * @returns 
 */
export const getSimbaInfo = (
    field?: string,
    contract?: string,
) => {
    const entryParams = {
        field,
        contract,
    }
    SimbaConfig.log.debug(`:: ENTER : entryParams : ${JSON.stringify(entryParams)}`);
    if (!contract && !field) {
        SimbaInfo.printAllSimbaJson();
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
    if (contract) {
        switch (contract){
            case ("all"): {
                SimbaInfo.printAllContracts();
                break;
            }
            default: {
                SimbaInfo.printSingleContract(contract);
                break;
            }
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }

    if (field) {
        switch (field) {
            case (SimbaJsonFields.ALL): {
                SimbaInfo.printAllSimbaJson();
                break;
            }
            case (SimbaJsonFields.APP): {
                SimbaInfo.printApp();
                break;
            }
            case (SimbaJsonFields.ORG): {
                SimbaInfo.printOrg();
                break;
            }
            case (SimbaJsonFields.AUTH): {
                SimbaInfo.printAuthProviderInfo();
                break;
            }
            case (SimbaJsonFields.CONTRACTS): {
                SimbaInfo.printAllContracts();
                break;
            }
            case (SimbaJsonFields.DEPLOY): {
                SimbaInfo.printMostRecentDeploymentInfo();
                break;
            }
            case (SimbaJsonFields.BASEURL): {
                SimbaInfo.printBaseURL();
                break;
            }
            case (SimbaJsonFields.AUTHTOKEN): {
                SimbaInfo.printAuthToken();
                break;
            }
            case (SimbaJsonFields.W3): {
                SimbaInfo.printWeb3Suite();
                break;
            }
            default: {
                const simbaFieldObject = SimbaConfig.ProjectConfigStore.get(field);
                if (simbaFieldObject) {
                    SimbaInfo.printChalkedObject(simbaFieldObject, field);
                } else {
                    SimbaConfig.log.error(`${chalk.redBright(`field ${chalk.greenBright(`${field}`)} is not present in your simba.json`)}`);
                }
                break;
            }
        }
        SimbaConfig.log.debug(`:: EXIT :`);
        return;
    }
}
