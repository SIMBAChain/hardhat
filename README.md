# @simbachain/hardhat

Hardhat plugin for deploying smart contracts to the SIMBA Chain Blocks platform.

# Table of Contents:
1. [Summary](#summary)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Settings](#project-settings)
5. [Usage](#usage)
    - [Contract Compilation](#contract-compilation)
    - [Tasks](#tasks)
      - login
      - export
      - deploy
      - logout
      - help
      - loglevel
6. [Environment Extensions](#environment-extensions)
7. [Deploying and Linking Libraries](#deploying-and-linking-libraries)

## Summary

Do you love SIMBA Chain? Do you love Hardhat? Then you're in luck! The Hardhat plugin for SIMBA Chain allows you to deploy smart contracts to your preferred blockchain through the SIMBA Blocks platform, using the same Hardhat web3 suite that you're used to developing and testing your smart contracts with. All you have to do to use the plugin is install it in your Hardhat project, compile your contracts, and then follow a few simple steps to deploy your smart contracts to chain through the Blocks platform. If you're not familiar with SIMBA's Blocks platform, it allows you to deploy smart contracts and automatically generate REST API endpoints that allow you to easily interact with your deployed smart contract.

## Prerequisites
You should have a SIMBA Enterprise Platform Instance to communicate with. Additionally you must have a least one contract application created in the instance. To create an application, open your browser, navigate to your instance and log in using your SIMBA user account. Click on your organization -> Applications and then click on the "Add" button. Follow the on screen instructions to create your application.

You will also need to create your Hardhat TypeScript project. To do so, follow the very brief instructions at https://hardhat.org/tutorial/creating-a-new-hardhat-project.html . Once get to the point where you are creating your project, you will see the following graphic, below. Select "Create an advanced sample project that uses TypeScript".

```
888    888                      888 888               888
888    888                      888 888               888
888    888                      888 888               888
8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
888    888 .d888888 888    888  888 888  888 .d888888 888
888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888

👷 Welcome to Hardhat v2.9.5 👷‍

? What do you want to do? … 
  Create a basic sample project
  Create an advanced sample project
❯ Create an advanced sample project that uses TypeScript
  Create an empty hardhat.config.js
  Quit
```

If you already have a hardhat project written in JavaScript, then to convert it to a TypeScript project, run:

```
$ mv hardhat.config.js hardhat.config.ts
```

# Installation

The objects/code that this plugin is built on are contained in @simbachain/web3-suites project, but all of this is abstracted away from the developer. Though if you want a brief summary of that code, you can check out the npm publication for that project.

For installation, just run:

```bash
$ npm install @simbachain/hardhat
```

Import Simba Hardhat plugin in your `Hardhat.config.ts`:

```ts
import "@simbachain/hardhat";
```

Then run the following command to make sure everything is installed correctly:

```
$ npx hardhat simba help
```

And then you should see the following:

```
? Please choose which commmand you would like help with › - Use arrow-keys. Return to submit.
❯   login
    export
    deploy
    logout
    simbajson
    generalprocess
    loglevel
    sync
    viewcontracts
```

## Project Settings

To use the SIMBA Chain Hardhat plugin, you will need to configure your simba.json file. Your simba.json file should live in the top level of your Hardhat project, and should contain values for baseURL and web3Suite:

```json
{
  "baseURL": "https://simba-dev-api.platform.simbachain.com/v2",
  "web3Suite": "hardhat"
}
```

In addition to these base configs, you can also specify a different contracts directory and build directory in simba.json, in case these directories are not located in the default location for your web3 project, BUT YOU SHOULD NOT CONFIGURE THE FOLLOWING FIELDS UNLESS THE LOCATION OF YOUR CONTRACTS OR BUILD ARTIFACTS HAS BEEN CHANGED FROM THEIR DEFAULT LOCATION FOR SOME REASON.

```json
...
"buildDirectory": "custom build directory location",
"contractDirectory": "custom contract directory location"
```

# Usage

## Contract Compilation
Contract compilation is achieved through the base Hardhat CLI. To compile your contracts, first write them and save them in your <project folder>/contracts/ directory. Then run:

```
$ npx hardhat compile
```

This will save your compiled contracts to your <project folder>/artifacts/ directory.

## Exporting Contracts, Deploying Contracts, and Other Commands/Tasks

The SIMBA Chain Hardhat plugin extends the tasks that are available to developers, and allows for the deployment of smart contracts by using custom defined Hardhat tasks. The following will explain what tasks are (VERY briefly), and how to use SIMBA's custom tasks.

## Tasks

If you're not familiar with tasks in Hardhat, the best way to think about them is: "anything you can do in Hardhat is a task." So just think of tasks as commands. The SIMBA Chain plugin simply extends what tasks are available to developers while using Hardhat. The main CLI entry point task added by this plugin is the "simba" task. This task then takes a subtask as a parameter. Then, depending on the subtask selected, optional parameters can be passed. So the template CLI input for running a Simba Hardhat plugin task is:

```
npx hardhat simba <subtask> <optional args>
```

Below, we explain the Hardhat tasks that you will use in the SIMBA plugin to deploy your contracts. They are listed and explained in the order that you would follow to login and deploy your contracts. Then, information is provided on other tasks, such as "help" and "loglevel".

1. login

*NOTE* : you need to have at least one app present in the SIMBA Chain org that you try to log into, otherwise the plugin will return an error during login. This is because, to deploy a contract, SIMBA needs to know which app you are deploying to. You can create an empty app, which is sufficient, by going to the UI, logging into your org, and creating an app there.

Once you have configured your simba.json file, you will be able to login. the Hardhat plugin uses keycloack device login, so you will be given a URL that you can navigate to, to grant permission to your device. You will then be prompted to select the organization and application from SIMBA Chain that you wish to log into. To log in, simply run

```
$ npx hardhat simba login
```

You will then see something similar to:

```
simba: Please navigate to the following URI to log in:  https://simba-dev-sso.platform.simbachain.com/auth/realms/simbachain/device?user_code=JPGL-RFRW 
2022-05-16 02:17:02.236  INFO  [KeycloakHandler.getAuthToken] 
simba: still waiting for user to login... 
```

Simply navigate to the specified URL and grant permission to your device, and you will be prompted to choose your organization:

```
? Please pick an organisation › - Use arrow-keys. Return to submit.
❯   CarNFTs
    CoffeeSupplyChain
    LennysGhost
```

You will then be prompted to select your application, with something like:

```
? Please pick an application › - Use arrow-keys. Return to submit.
❯   testApp
    testAppNewContracts
    revisedApp
```

2. export

Once you have logged in, you will be able to export your contracts, which will save them to your organization's contracts (you can also think of this action as "importing" your contracts to Blocks). For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run

```
$ npx hardhat simba export
```

You will then be prompted to select all of the contract you want to export to Blocks:

```
? Please select all contracts you want to export. Please note that if you're exporting contract X, and contract X depends on library Y, then you need to export Library Y along with Contract X. SIMBA Chain will handle the library linking for you. ›  
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    a: Toggle all
    enter/return: Complete answer
◯   CoffeeERC721
◯   CoffeeUpgradable
◯   WatchERC721
◯   WatchUpgradable
```

As the prompt indicates, if you are going to be exporting contract X, and it depends on library Y, then you need to export library Y along with contract X. This does not mean that if you've ALREADY exported libray Y in a previous export command, you need to export it again. 

If you want to export just one specific contract, you can specify a primary contract by passing the --prm flag, followed by the contract name:

```
$ npx hardhat simba export --prm CoffeeERC721
```

3. deploy: 

After you have logged in and exported your contract, you will be able to deploy your contract. This step will generate the REST API endpoints that you can use to interact with your smart contract's methods, and save them to your organization and app. You will then be able to access those endpoints through either the SIMBA Blocks UI, or programatically through one of SIMBA's SDKs. To deploy, you have two options. First, you can run

```
$ npx hardhat simba deploy
```

If you run the above command, you will be prompted to selected which contract you want to deploy from a list of contracts you have exported. Second, you can specify the primary contract you want to deploy by running:

```
$ npx hardhat simba deploy --prm <contract name you want to deploy>
```

If your contract's constructor takes parameters, then you will see the following prompt, asking you to specify how you would like to provide the values for these parameters:

```
? Your constructor parameters can be input as either a single json object or one by one from prompts. Which would you prefer? › - Use arrow-keys. Return to submit.
❯   enter all params as json object
    enter params one by one from prompts
```

Then you will be asked to specify API name, blockchain you want to deploy to, offchain storage (AWS, Azure, no storage, etc., but this depends on what you have configured for your account), and the values for your contract's constructor, based on the way you answered the last prompt above:

```
simba deploy: gathering info for deployment of contract CoffeeERC721 
✔ Please choose an API name for contract CoffeeERC721 [^[w-]*$] … CoffeeERC721V1
✔ Please choose the blockchain to deploy to. › Quorum
✔ Please choose the storage to use. › No Storage
? Please enter any arguments for the contract as a JSON dictionary. › {"ownerName": "Brendan", "poundWeight": 13}
```

And just like that, your contract is deployed! If you want to view information on contract deployments you've made through the plugin, you can go to your simba.json, where you will find info similar to what's found below. So if you need ot reference any information, you can find it there.

```json
	"most_recent_deployment_info": {
		"address": "0x2B9d4cD4bEc9707Db7fE42d107C0F2D180B3dA45",
		"deployment_id": "5b041a32-f1c4-465f-80bf-52e76379f66c",
		"type": "contract"
	},
	"contracts_info": {
		"MetadataLib": {
			"design_id": "f66163a7-63de-4d8b-98d9-12e72148341f",
			"address": "0x69A48097c643CD9dCDc3574F406092a95A660678",
			"deployment_id": "3c860020-d762-464c-a293-25caa23c3f63",
			"contract_type": "library"
		},
		"CoffeeERC721": {
			"design_id": "025e1161-c917-45f0-8a81-42180753da9b",
			"address": "0x2B9d4cD4bEc9707Db7fE42d107C0F2D180B3dA45",
			"deployment_id": "5b041a32-f1c4-465f-80bf-52e76379f66c",
			"contract_type": "contract"
		}
	}
```

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

Which will prompt you to select a help topic

```
? Please choose which commmand you would like help with › - Use arrow-keys. Return to submit.
❯   login
    export
    deploy
    logout
    simbajson
    generalprocess
    loglevel
    sync
    viewcontracts
```

Or you can pass an optional --topic flag to specify which topic you would like help with. For instance, for help with the "deploy" task, run

```
$ npx hardhat simba help --topic deploy
```

As indicated above, the available help topics are:

- login
- export
- deploy
- logout
- simbajson
- generalprocess
- loglevel
- sync
- viewcontracts

6. loglevel:

The Simba Hardhat plugin uses tslog for logging / debugging. Setting a log level through this command will set a MINIMUM log level. So for instance, if you set the log level to 'info', then logs of level SimbaConfig.log.info(...) as well as SimbaConfig.log.error(...) will be logged. Valid values for log levels are 'error', 'info', 'debug', 'silly', 'warn', 'trace', and 'fatal'. You can either run this command without any arguments, which will allow you to set a minimum log level from prompt:

```
$ npx hardhat simba loglevel
```

And you will be prompted to selected a minimum log level:

```
? Please choose the minimum level to set your logger to › - Use arrow-keys. Return to submit.
❯   debug
    error
    fatal
    info
    silly
    trace
    warn
```

Or you can set the specific log level from the CLI:

```
$ npx hardhat simba loglevel --lvl <desired log level>
```

If you pass an invalid log level, then the plugin defaults to "info".

## Environment extensions

This plugin extends the Hardhat Runtime Environment by adding the fields:

- hre.simba
- hre.login
- hre.logout
- hre.deploy
- hre.export
- hre.setLogLevel
- hre.viewContracts
- hre.sync

## Deploying and Linking Libraries
A brief note here about deploying and linking libraries. You do not need to actively link libraries in this plugin. Once you have deployed your contract, SIMBA's Blocks platform handles that for you. All you need to do is make sure that if you are deploying a contractX that depends on libraryX, then first deploy libraryX. Then when you deploy contractX, the library linking will automatically be conducted by SIMBA. If you look in your simba.json after deploying a library, you will see a field for library_addresses (below) This field gets exported with other contracts, and is how SIMBA knows whether a contract needs to be linked to a library when it is deployed.

```json
...
	"library_addresses": {
		"MetadataLib": "0x96E07C02A523f254E17F23Cd577f4518B0c9A855"
	},
```

Adding libraries: If a contract that you are trying to deploy requires an external library that you did not deploy to SIMBA Chain, but you have the name and address of that library, then you can add the library by running the following command, which does not take parameters:

```
$ npx hardhat simba addlib
```

and you will then be prompted to specify the name and address of your library. If you want to specify the name and address of the library from the CLI, then you can run:

```$ npx hardhat simba addlib --libname <library name> --libaddr <library address>
```

