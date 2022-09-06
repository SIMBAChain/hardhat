import {
    SimbaConfig,
} from "@simbachain/web3-suites";
import deployContract from "../../tasks/deploycontract";
import { expect } from 'chai';
// import { execSync } from "child_process";
import {default as chalk} from 'chalk';
import axios from "axios";
// import robot from "robotjs";
// var ks = require('node-key-sender');

// var robot = require("robotjs");
import 'mocha';

const deployInfo = {
    url: "organisations/20e69814-43d0-42b4-8499-d13a9d1afb23/contract_designs/6bbd0b0d-c5b2-4488-90a9-8357b77f1850/deploy/",
    blockchain: "Quorum",
    storage: "azure",
    api: "ourtestapi",
    args: {
        _ourNum: 13,
        _ourString: "testing",
    },
}

describe('tests deploy', () => {
    it('testing that endpoint is being hit correctly, but not actually deploying since "ourtestapi" already exists', async () => {
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        let detail: any;
        const res = await deployContract(undefined, deployInfo);
        if (axios.isAxiosError(res) && res.response) {
                detail = res.response.data.errors[0].detail;
            } else {
                SimbaConfig.log.error(`${chalk.redBright(`\nsimba: unknown error type`)}`);
            }
        expect(detail).to.equal(`name ${deployInfo.api} already exists`);
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(150000);
});
