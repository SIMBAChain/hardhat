import {
    SimbaConfig,
    AllDirs,
} from "@simbachain/web3-suites";
import {setOrGetDir} from "../../src/tasks/dirs";
import { expect } from 'chai';
import 'mocha';


describe('tests setDir, resetDir', () => {
    it('directories should be set in simba.json after calls', async () => {
        // grab full simba.json so we can use it to reset after
        const originalSimbaJson = SimbaConfig.ProjectConfigStore.all;
        SimbaConfig.ProjectConfigStore.delete("buildDirectory");
        const testDirName = "someNewDirectory";
       
        // setDir
        setOrGetDir("set", AllDirs.BUILDDIRECTORY, testDirName);
        setOrGetDir("set", AllDirs.ARTIFACTDIRECTORY, testDirName);
        setOrGetDir("set", AllDirs.CONTRACTDIRECTORY, testDirName);
        // posterior
        expect(SimbaConfig.ProjectConfigStore.get("buildDirectory")).to.equal(testDirName);
        expect(SimbaConfig.ProjectConfigStore.get("artifactDirectory")).to.equal(testDirName);
        expect(SimbaConfig.ProjectConfigStore.get("contractDirectory")).to.equal(testDirName);

        // resetDir
        setOrGetDir("set", AllDirs.BUILDDIRECTORY, "reset");
        setOrGetDir("set", AllDirs.ARTIFACTDIRECTORY, "reset");
        setOrGetDir("set", AllDirs.CONTRACTDIRECTORY, "reset");
        //posterior
        expect(SimbaConfig.ProjectConfigStore.get("buildDirectory")).to.not.exist;
        expect(SimbaConfig.ProjectConfigStore.get("artifactDirectory")).to.not.exist;
        expect(SimbaConfig.ProjectConfigStore.get("contractDirectory")).to.not.exist;

        // now reset simba.json to its original state
        SimbaConfig.ProjectConfigStore.clear();
        SimbaConfig.ProjectConfigStore.set(originalSimbaJson);
    }).timeout(1000);
});