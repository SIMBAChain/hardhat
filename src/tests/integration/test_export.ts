import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import exportContract from "../../tasks/exportcontract";
import { expect } from 'chai';
import 'mocha';

describe('tests export', () => {
    it('design_id for TestContractChanged should be different, then stay the same', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const originalDesignID = originalSimbaJson.contracts_info.TestContractChanged.design_id;
        await exportContract(undefined, false);
        const newDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
        expect(newDesignID).to.exist;
        expect(originalDesignID).to.not.equal(newDesignID);

        await exportContract(undefined, false);
        const newestDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
        expect(newDesignID).to.exist;
        expect(newDesignID).to.equal(newestDesignID);

        // reset
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(10000);
});
