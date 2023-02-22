import {
    SimbaConfig,
    allContracts,
} from "@simbachain/web3-suites";
const web3SuitesLib = require("@simbachain/web3-suites");
import {exportContract} from "../../src/tasks/exportcontract";
import {deleteContract} from "../../src/tasks/contract/deletecontract"
const deleteLib = require("../../src/tasks/contract/deletecontract");
import { expect } from 'chai';
import {
    allContractsFake,
    allContractsFakeAfterDelete,
} from "../tests_setup";
import 'mocha';
import sinon from "sinon";

describe('tests deleteContract', () => {
    it('design_id should not be present in allContracts[i].id after deleteContract is called', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;


        // grab all fake contracts from our environment/instance
        let _allContracts = await allContractsFake() as any;
        const firstContractID = _allContracts[0].id;

        // delete the contract we just exported
        const sandbox = sinon.createSandbox();
        sandbox.stub(deleteLib, "deleteContract").callsFake(() => {});
        await deleteContract(firstContractID);
        

        // now gather all fake contracts after deletion
        _allContracts = await allContractsFakeAfterDelete() as any;
        sandbox.restore();

        // now check to make sure contract isn't present in results
        let idIsPresentInAllContracts = false;
        for (let i = 0; i < _allContracts.length; i++) {
            const entry = _allContracts[i];
            const id = entry.id;
            if (id === firstContractID) {
                idIsPresentInAllContracts = true;
                break;
            }
        }

        // now contract should no longer be present in results
        expect(idIsPresentInAllContracts).to.equal(false);

        // reset
        sandbox.restore();
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(200000);
});
