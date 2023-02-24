import {
    SimbaConfig,
    KeycloakHandler,
} from "@simbachain/web3-suites";
import {exportContract} from "../../src/tasks/exportcontract";
const exportLib = require("../../src/tasks/exportcontract");
import {
    exportWithNewSourceCode,
} from "../tests_setup";
import { expect } from 'chai';
import 'mocha';
import sinon from "sinon";

describe('tests export', () => {
    it('design_id for TestContractChanged should be different, then stay the same', async () => {
        // this stub test is mostly just so other devs can understand what happens inside simba.json
        // when we export a contract, and understand that only contracts with source code
        // that has been changed since their last export, will be exported
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        // const authStore = await SimbaConfig.authStore();
        // await authStore!.performLogin(false);
        
        let sandbox = sinon.createSandbox();
        const stub = sandbox.stub(KeycloakHandler.prototype, "doPostRequest").resolves(exportWithNewSourceCode());

        await exportContract(undefined, false);

        // checking that since it's a new contract, we doPostRequest
        expect(stub.called).to.be.true;

        // now check info that we manually wrote to simba.json using fake function, for illustration's sake
        let updatedContractChanged = SimbaConfig.ProjectConfigStore.get("contracts_info").TestContractNewestUpdated
        expect(updatedContractChanged.design_id).to.equal("this would be a new design id");
        expect(updatedContractChanged.contract_type).to.equal("contract");
        expect(updatedContractChanged.source_code).to.equal("this source code would be different than from previous export");
        
        // reset
        sandbox.restore();
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(150000);
});
