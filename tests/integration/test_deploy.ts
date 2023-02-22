import {
    SimbaConfig,
} from "@simbachain/web3-suites";
const deployLib = require("../../src/tasks/deploycontract");
import {deployContract} from "../../src/tasks/deploycontract";
import {deployFakeContract} from "../tests_setup";
import { expect } from 'chai';
import 'mocha';
import sinon from "sinon";


const deployInfo = {
    url: "v2/organisations/9c261cb5-d0a5-4817-9b14-144999969d11/contract_designs/0b682b08-951b-4e31-810c-46f49f0a98ae/deploy/",
    blockchain: "Quorum",
    // storage: "azure",
    api: "ourtestapi11",
    args: {
        _ourNum: 13,
        _ourString: "testing",
    },
}

describe('tests deploy', () => {
    it('after calling deployContract, deployment_id and most_recent_deployment_info are in simba.json', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        // const authStore = await SimbaConfig.authStore();
        // await authStore!.performLogin(false);
        const deploymentInfoForSimbaJson = {
            "address": "0xe97B0f55E9E559A77F4F9f7C49dAe2AE6341887D",
            "transaction_hash": "0xe4c5993631b7adcb49dbc47d122003e84713f9b89f925654e6e660147d1b9539",
            "deployment_id": "33221a18-ce39-487a-bf11-1bdcdf436756",
            "type": "contract",
        };

        const sandbox = sinon.createSandbox();

        sandbox.stub(deployLib, "deployContract").callsFake(() => {
            deployFakeContract(deploymentInfoForSimbaJson);
        });

        await deployContract(undefined, deployInfo);
        
        const mostRecentDeploymentInfo = SimbaConfig.ProjectConfigStore.get("most_recent_deployment_info");
        expect(mostRecentDeploymentInfo.address).to.equal(deploymentInfoForSimbaJson.address);
        expect(mostRecentDeploymentInfo.transaction_hash).to.equal(deploymentInfoForSimbaJson.transaction_hash);
        expect(mostRecentDeploymentInfo.deployment_id).to.equal(deploymentInfoForSimbaJson.deployment_id);
        expect(mostRecentDeploymentInfo.type).to.equal(deploymentInfoForSimbaJson.type);
        
        const deploymentID = SimbaConfig.ProjectConfigStore.get("deployment_id");
        expect(deploymentID).to.equal("33221a18-ce39-487a-bf11-1bdcdf436756");
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
        sandbox.restore();
    }).timeout(100000);
});

