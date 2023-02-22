import {
    SimbaConfig,
    authErrors,
} from '@simbachain/web3-suites';
import {default as chalk} from 'chalk';

/**
 * deletes auth token from configstore (authconfig.json)
 * @returns 
 */
const logout = async () => {
    SimbaConfig.log.debug(`:: ENTER :`);
    const authStore = await SimbaConfig.authStore();
    if (!authStore) {
        SimbaConfig.log.error(`${chalk.redBright(`\nsimba: no authStore created. Please make sure your baseURL is properly configured in your simba.json`)}`);
        return Promise.resolve(new Error(authErrors.badAuthProviderInfo));
    }
    await authStore.logout();
    SimbaConfig.log.info(`${chalk.cyanBright(`\nsimba: you have logged out.`)}`)
    SimbaConfig.log.debug(`:: EXIT :`);
}

export default logout;