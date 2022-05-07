import "hardhat/types/config";
import "hardhat/types/runtime";
declare module "hardhat/types/config" {
    interface ProjectPathsUserConfig {
        newPath?: string;
    }
    interface ProjectPathsConfig {
        newPath: string;
    }
}
declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        login: (hre: HardhatRuntimeEnvironment) => Promise<void | Error>;
        simba: (hre: HardhatRuntimeEnvironment, cmd: string, primary?: string, deleteNonExportedArtifacts?: string) => Promise<void>;
        deploy: (hre: HardhatRuntimeEnvironment) => Promise<void>;
        export: (hre: HardhatRuntimeEnvironment) => Promise<void>;
        logout: (hre: HardhatRuntimeEnvironment) => Promise<void>;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map