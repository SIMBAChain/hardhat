# @simbachain/hardhat

hardhat plugin for deploying smart contracts to the SIMBA Chain Blocks platform.

## Summary

Do you love SIMBA Chain? Do you love hardhat? Then you're in luck! The hardhat plugin for SIMBA Chain allows you to deploy contracts your preferred blockchain through the SIMBA Blocks platform, using the same hardhat web3 suite that you're used to developing and testing your smart contracts with. All you have to do to use the plugin is install it in your hardhat project, along with the @simbachain/web3-suites plugin, compile your contracts, and then follow a few simple steps to deploy your smart contracts to chain through the Blocks platform. If you're not familiar with SIMBA's Blocks platform, it allows you to easily deploy smart contracts and automatically generate REST API endpoints that allow you to easily interact with your deployed smart contract.

## Installation

This plugin should be used along with the @simbachain/web3-suites plugin:

```bash
$ npm install @simbachain/hardhat
$ npm install @simbachain/web3-suites
```

Import both plugins in your `hardhat.config.ts`:

```ts
import "@simbachain/hardhat";
import "@simbachain/web3-suites";
```

## Tasks

The main CLI entry point task added by this plugin is the "simba" task. This task then takes a subtask as a parameter. Then, depending on the subtask selected, optional parameters can be passed. So the template CLI input for running a Simba hardhat plugin task is:

```
npx hardhat simba <subtask> <optional args>
```

1. login

Once you have configured your simba.json file, you will be able to login. the hardhat plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run

```
$ npx hardhat simba login
```

2. export

Once you have logged in, you will be able to export your contracts, which will save them to your organization's contracts. For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run

```
$ npx hardhat simba export
```

If you want to export with optional arguments, you can specify a primary contract by passing the --prm flag, followed by the contract name. You can also pass the --dltnon flag with argument 'false', which means your non-primary contract artifacts will not be deleted from the object that you export to SIMBA Chain. You pass this second argument if you are exporting more than one contract to Simba Chain simultaneously, though this is not standard practice, and most of the time you will not need to pass this flag. If you wanted to export multiple contracts, with the primary contract having name 'MyPrimaryContract', then you would RUN

```
$ npx hardhat simba export --prm <your primary contract> --delnon false
```

3. deploy: 

After you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the Blocks (Simba Chain) UI, or programatically through one of Simba's SDKs. To deploy, run

```
$ npx hardhat simba deploy
```

You will then be prompted to:

- choose how you want to specify your contract's constructor parameters (as either a JSON object or one by one)
- choose an API name for your contract
- select the blockchain you want to deploy to
- choose which storage to use (AWS, Azure, etc., but this depends on what you have configured for your account)
- and finally, you will be asked to provide the parameters for your contract constructor, based on the response you gave to the first prompt

4. logout:

If you want to logout, then you can do so by running

```
$ npx hardhat simba logout
```

Doing so will delete your auth token in authconfig.json

5. help:

To choose a help topic from a list, run

```
$ npx hardhat simba help
```

Or you can pass the specific topic you want help with as an optional argument after the "help" task. For instance, for help with the "deploy" task, run

```
$ npx hardhat simba help deploy
```

Your options for this optional argument are:

- login
- export
- deploy
- logout
- simbajson
- generalprocess

## Environment extensions

This plugin extends the Hardhat Runtime Environment by adding the fields:

- hre.simba
- hre.login
- hre.logout
- hre.deploy
- hre.export

## Configuration

The only configuration necessary to use the SIMBA Chain hardhat plugin is of your simba.json file. See the "Usage" section below for information on what should be contained in your simba.json file.

## Usage

### general process:
The general process to follow for compiling, exporting, and deploying contracts is as follows:

1. First, you need to make sure that you your simba.json file is correctly configured with all necessary fields. For information on what should be contained in simba.json, please run

```
$ npx hardhat simba help simbajson.
```

Your simba.json file should live in the top level of your hardhat project, and should contain values for authURL (for Keycloak), clientID (for Keycloak), realm (for Keycloak), baseURL (for SIMBA Blocks), and web3Suite (should always be "hardhat" for this plugin). An example would look like:

```
{
  "baseURL": "https://simba-dev-api.platform.simbachain.com/v2",
  "realm": "simbachain",
  "web3Suite": "hardhat",
  "authURL": "https://simba-dev-sso.platform.simbachain.com",
  "clientID": "simba-pkce"
}
```

2. Next, you'll need to login to SIMBA Chain. To do so, run

```
$ npx hardhat simba login
```

Then follow the prompts to choose your organization and application.


3. Then, you will need to compile your contracts (this can also be done before you login). To compile your contracts, run

```
$ npx hardhat compile
```

4. Next, you will need to export your contract. What this will do is save your contract to your organization's saved contracts on simbachain.com. To export, run 

```
$ npx hardhat simba export
```

Then follow the prompts to select which contract you want to export. For more information on export, run 

```
$ npx hardhat simba help export
```

5. Finally, to deploy your contract, which will save the contract to your application and create API endpoints for the contract's methods, you will run

```
$ npx hardhat simba deploy
```

You will then follow the prompts to choose the API for your deployed contract, the blockchain you wish to deploy to, the storage you wish to use, and any constructor arguments for the contract. For more information on deploying, run

```
$ npx hardhat simba help deploy
```

6. If you would like to logout, which deletes your auth token info in authconfig.json, just run

```
$ npx hardhat simba logout
```
