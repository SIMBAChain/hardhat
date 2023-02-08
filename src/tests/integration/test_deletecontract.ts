import {
    SimbaConfig,
    allContracts,
} from "@simbachain/web3-suites";
import exportContract from "../../tasks/exportcontract";
import deleteContract from "../../tasks/contract/deletecontract"
import { expect } from 'chai';
import 'mocha';

describe('tests deleteContract', () => {
    it('design_id should not be present in allContracts[i].id after deleteContract is called', async () => {
        const authStore = await SimbaConfig.authStore();
        await authStore!.performLogin(false);
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        const originalDesignID = originalSimbaJson.contracts_info.TestContractChanged.design_id;
        await exportContract(undefined, false);
        const newDesignID = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractChanged.design_id;
        expect(newDesignID).to.exist;
        expect(originalDesignID).to.not.equal(newDesignID);

        let _allContracts = await allContracts() as any;
        let idIsPresentInAllContracts: boolean = false;
        for (let i = 0; i < _allContracts.length; i++) {
            const entry = _allContracts[i];
            const id = entry.id;
            if (id === newDesignID) {
                idIsPresentInAllContracts = true;
                break;
            }
        }
        expect(idIsPresentInAllContracts).to.equal(true);

        // delete the contract we just exported
        await deleteContract(newDesignID);

        // now gather contracts again
        _allContracts = await allContracts() as any;
        idIsPresentInAllContracts = false;
        for (let i = 0; i < _allContracts.length; i++) {
            const entry = _allContracts[i];
            const id = entry.id;
            if (id === newDesignID) {
                idIsPresentInAllContracts = true;
                break;
            }
        }

        // now contract should no longer be present in results
        expect(idIsPresentInAllContracts).to.equal(false);

        // reset
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(200000);
});
