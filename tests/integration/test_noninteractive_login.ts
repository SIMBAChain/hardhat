import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import login from "../../src/tasks/login";
import { expect } from 'chai';
import 'mocha';

describe('tests noninteractive login', () => {
    it('org and app should be present after login', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.ProjectConfigStore.delete("organisation");
        SimbaConfig.ProjectConfigStore.delete("application");
        const org = "brendan_birch_simbachain_com";
        const app = "BrendanTestApp";
        await login(false, org, app);
        expect(SimbaConfig.ProjectConfigStore.get("organisation").name).to.equal(org);
        expect(SimbaConfig.ProjectConfigStore.get("application").name).to.equal(app);
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(10000);
});
