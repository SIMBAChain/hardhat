# @simbachain/hardhat

Hardhat plugin for deploying smart contracts to the SIMBA Chain Blocks platform.

# Table of Contents:
1. [Summary](#summary)
2. [Installation Overview](#installation-overview)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Project Settings](#project-settings)
6. [Usage](#usage)
    - [Contract Compilation](#contract-compilation)
    - [Tasks](#tasks)
      - [login](#login)
      - [export](#export)
      - [deploy](#deploy)
      - [logout](#logout)
      - [help](#help)
      - [pull](#pull)
      - [viewcontracts](#viewcontracts)
      - [loglevel](#loglevel)
7. [Environment Extensions](#environment-extensions)
8. [Deploying and Linking Libraries](#deploying-and-linking-libraries)
9. [CI/CD](#continuous-integration-continuous-deployment)

## Summary

Do you love SIMBA Chain? Do you love Hardhat? Then you're in luck! The Hardhat plugin for SIMBA Chain allows you to deploy smart contracts to your preferred blockchain through the SIMBA Blocks platform, using the same Hardhat web3 suite that you're used to developing and testing your smart contracts with. All you have to do to use the plugin is install it in your Hardhat project, compile your contracts, and then follow a few simple steps to deploy your smart contracts to chain through the Blocks platform. If you're not familiar with SIMBA's Blocks platform, it allows you to deploy smart contracts and automatically generate REST API endpoints that allow you to easily interact with your deployed smart contract.

## Installation Overview
The following are the general steps to get going with the SIMBA Chain Hardhat plugin. The rest of the documentation provides details on these and other steps.

1. create a directory for your Hardhat project.
2. cd into that directory and start an npm project.
3. install hardhat in that project / directory. This directory, where your package.json will live, is where you will run your Hardhat commands from.
4. install the SIMBA Chain Hardhat plugin
5. add a 'require' or 'import' statement to your hardhat.config.js or hardhat.config.ts file, depending on which file your project has.
6. create a simba.json file in the top level of your project, and populate that file with 'baseURL' and 'web3Suite' fields.
7. run `npx hardhat simba help` to make sure the plugin is installed

## Prerequisites
You should have a SIMBA Enterprise Platform Instance to communicate with. Additionally you must have a least one contract application created in the instance. To create an application, open your browser, navigate to your instance and log in using your SIMBA user account. Click on your organization -> Applications and then click on the "Add" button. Follow the on screen instructions to create your application.

Next, create a directory where you want your Hardhat project to live, eg:

```
$ mkdir my_hardhat_project
```

And then cd into that project:

```
$ cd my_hardhat_project
```

Then create an npm project in that directory:

```
$ npm init
```

You can hit return/enter through the npm prompts if you'd like

**NOTE: It is this level of your project, where your package.json lives, where you will run your Hardhat CLI commands**

You will also need to create your Hardhat TypeScript project. To do so, from the directory where your package.json now lives, run:

```
$ npx hardhat
```

For more info on starting a Hardhat project, you can follow the very brief instructions at https://hardhat.org/tutorial/creating-a-new-hardhat-project.html . Once get to the point where you are creating your project, you will see the following graphic, below. Select "Create an advanced sample project that uses TypeScript".

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

We suggest you just create a TypeScript Hardhat project from scratch, as instructed above. However, if you already have a hardhat project written in JavaScript, then to convert it to a TypeScript project, please follow the very brief, very clear documentation that Hardhat provides:

https://hardhat.org/guides/typescript

# Installation

The objects/code that this plugin is built on are contained in @simbachain/web3-suites project, but all of this is abstracted away from the developer. Though if you want a brief summary of that code, you can check out the npm publication for that project.

For installation, just run:

```bash
$ npm install @simbachain/hardhat
```

Then, import Simba Hardhat plugin in your `Hardhat.config.ts`:

```ts
import "@simbachain/hardhat";
```

Or if you have a Hardhat.config.js file, add a require statement:

```javascript
require("./simba_hardhat");
```

## Project Settings

To use the SIMBA Chain Hardhat plugin, you will need create and configure a simba.json file. Your simba.json file should live in the top level of your Hardhat project, where your package.json file lives, and should contain values for baseURL and web3Suite:

NOTE: the following baseURL is an example, and will likely be different for your environment

```json
{
  "baseURL": "https://simba-demo-api.platform.simbachain.com/v2",
  "web3Suite": "hardhat"
}
```

**NOTE: some notes/hints regarding simba.json in your Hardhat project:**

It may be tempting to just try and start a Truffle project in the same directory as a Hardhat project. ***Do not do this.*** Hardhat projects and Truffle projects should have their own `simba.json` files. Thus, best practice for switching:

* between hardhat and truffle **plugins**, and/or
* between **hosted environments**
    
is that you do so in either a new directory or new branch, where your new `simba.json` file takes the format:
​
```json
    {
    "baseURL": "https://{your-new-environment-domain}/{version}/",
    "web3Suite": "hardhat"
    }
```

**HINT 1:** if you *need* to change the value for `baseURL` in your `simba.json` file, then it is likely because you are targeting a new environment. In this scenario, many of the previous artifacts written to `simba.json` will no longer make sense in the context of your new environment. A distinct `simba.json` solves this problem.

**HINT 2:** if you *want* to change the value for `baseURL` in your `simba.json` file but keep working in the same project/directory, then please make sure to:

1. run `npx hardhat simba logout` prior to executing any operations in the new environment. This ensures that the prior `authProviderInfo` is removed from `simba.json`. Following this,
2. run `npx hardhat simba login`. This ensures that the correct `authProviderInfo` context is loaded. You are now ready to execute operations against the new environment.

In addition to these base configs, you can also specify a different contracts directory and build directory in simba.json, in case these directories are not located in the default location for your web3 project, **BUT YOU SHOULD NOT CONFIGURE THE FOLLOWING FIELDS UNLESS THE LOCATION OF YOUR CONTRACTS OR BUILD ARTIFACTS HAS BEEN CHANGED FROM THEIR DEFAULT LOCATION FOR SOME REASON.** These additional configurations would look like:

```json
{
    ...
    "buildDirectory": "custom build directory location",
    "contractDirectory": "custom contract directory location"
}
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
    pull
    viewcontracts
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

If you're not familiar with tasks in Hardhat, the best way to think about them is: "anything you can do in Hardhat is a task." So just think of tasks as commands. The SIMBA Chain plugin simply extends what tasks are available to developers while using Hardhat. The only true additional task in the Simba Hardhat plugin is the "simba" task: the main CLI entry point task added by this plugin is the "simba" task. This task then takes a subtask as a parameter. Then, depending on the subtask selected, optional parameters can be passed. So the template CLI input for running a Simba Hardhat plugin task is:

```
npx hardhat simba <subtask> <optional args>
```

So even though we refer to tasks such as "export" and "deploy," you can't run them directly from the "npx hardhat" command: running "npx hardhat export" will throw an error, but "npx hardhat simba export" will not. This is by design, to avoid collision with Hardhat native commands, such as "help".

Below, we explain the Hardhat tasks that you will use in the SIMBA plugin to deploy your contracts. They are listed and explained in the order that you would follow to login and deploy your contracts. Then, information is provided on other tasks, such as "help" and "loglevel".

### login

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

There is also a non-interactive login mode. This mode is mainly for CI/CD, but you can run this login mode like a normal login command if you have a few environment variables set, and it will use a client credentials flow for login. You will need to set

1. SIMBA_PLUGIN_ID for your client ID
2. SIMBA_PLUGIN_SECRET for your client secret, and 
3. SIMBA_PLUGIN_AUTH_ENDPOINT for your auth endpoint. 

NOTE: SIMBA_PLUGIN_AUTH_ENDPOINT defaults to '/o/' if not set.

To run login in non-interactive mode, you can run with org and app flag:

```
$ npx hardhat simba login --interactive false --org <myOrg> --app <myApp>
```

Or you can run with just the app flag, if you already have logged into an org before, and just want to switch your app:

```
$ npx hardhat simba login --interactive false --app <myApp>
```

If you already have an org and app set in simba.json, and want to use that org and app, you can just run:

```
$ npx hardhat simba login --interactive false
```

However, if you specify an org, you must specify an app. The following will throw an error:

```
$ npx hardhat simba login --interactive false --org <myOrg>
```

### export

Once you have logged in, you will be able to export your contracts, which will save them to your organization's contracts (you can also think of this action as "importing" your contracts to Blocks). For this command, you can either run export without arguments, or with optional arguments. To export without optional arguments, run

```
$ npx hardhat simba export
```

You will then be prompted to select all of the contracts you want to export to Blocks:

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

If you want to export just one specific contract, you can specify a primary contract by passing the --prm flag, followed by the contract name:

```
$ npx hardhat simba export --prm CoffeeERC721
```

There is also a non-interactive export mode. This mode is mainly for CI/CD, but it can be run just like any other export command. If you want to export all contracts that have compiled changes since the last time you exported, then you can export in non-interactive mode. Note that this will not export contracts that are strictly dependencies (eg OpenZeppelin imported contracts). To run export in non-interactive mode, run:

```
$ npx hardhat simba export --interactive false
```

### deploy

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

NOTE: regarding your API name, this just needs to be a unique name containing alphanumeric characters and/or underscores. So if your contract is called MyTokenContract, consider giving your API a name something like MyTokenContract_v1.

And just like that, your contract is deployed! If you want to view information on contract deployments you've made through the plugin, you can go to your simba.json, where you will find info similar to what's found below. So if you need to reference any information, you can find it there.

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

### logout

If you want to logout, then you can do so by running

```
$ npx hardhat simba logout
```

Doing so will delete your auth token in authconfig.json

### help

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
    pull
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
- pull
- viewcontracts

### pull
This command is mainly designed to be used in the CI/CD process, but it can actually be used for many things. Regarding the CI/CD use, if you use CI/CD to export your contracts in the CI/CD pipeline after you push, then you'll need to update your project's simba.json after you do a git pull. This is because the plugin relies on the "source_code" field for each contract in your simba.json's "contract_info" section to know which contracts to export. So to get the most up to date version of your exported contracts' source code in your simba.json, just run:

```
$ npx hardhat simba pull
```

In addition to pulling source code for your simba.json, you can also use the pull command to pull the most recent versions of your solidity contracts from SIMBA Chain and place them in your /contracts/ directory. 

A brief note on file structure is worthwhile here. By default, contracts pulled from SIMBA Chain will be written to /contracts/SimbaImports/ directory. If you would like to place pulled files in the top level of your /contracts/ directory, then you can pass the --usesimbapath false flag in your call. 

A note on file names is also in order. Files that are pulled form SIMBA are placed into files named after the contract name. So if you have two contracts, token1 and token2, which both originally lived in OurTokens.sol. Then both of those will end up in files named token1.sol and token2.sol. This is done becuase, currently, contracts that are pushed to SIMBA Chain sit in a flat structure, without sub-directories.

Usually, you shouldn't need to do pull contracts from SIMBA if you have git pulled, but there may be cases when, for instance, you want ALL of your most recent contracts from your SIMBA Chain organisation, even ones that weren't living in your current project. In that case, you can run:

```
$ npx hardhat simba pull --pullsolfiles true
```

This will pull all most recent contracts from your SIMBA Chain org and place them in your /contracts/SimbaImports/ folder.

If you want to place your pulled contracts in the top level of your /contracts/ directory, instead of into /contracts/SimbaImports/, then you can run:

```
$ npx hardhat simba pull --pullsolfiles true --usesimbapath false
```

If you would like to interactively choose which .sol contract files to choose, in addition to auto pulling your source code for your simba.json, you can run:

```
$ npx hardhat simba pull --interactive true
```

If you would like to skip pulling your simba.json source code (though you really should not), you can set the --pullsourcecode flag to false. For example, the following command will only pull your .sol contract files:

```
$ npx hardhat simba pull --pullsourcecode false --pullsolfiles true
```

If you would like to pull your .sol contract files interactively, while skipping your simba.json source code pull, you can run:

```
$ npx hardhat simba pull --pullsourcecode false --interactive true
```

If you want to pull a specific contract's most recently exported edition, by name, from SIMBA, then you can run:

```
$ npx hardhat simba pull --contractname <your contract name>
```

If you would like to pull a specific contract version from its design_id, you can run:

```
$ npx hardhat simba pull --id <your contract design_id>
```

Contract design IDs can be referenced in your simba.json file under contracts_info -> contract name -> design_id. Contract design IDs can also be viewed by running:

```
npx hardhat simba viewcontracts
```

### view contracts

This command will return information pertaining to all contracts saved to your organisation on SIMBA Chain. Contract info includes: name, id, and version. For this command, just run:

```
$ npx hardhat simba viewcontracts
```

### loglevel

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

## CI/CD
### Continuous Integration Continuous Deployment

SIMBA Chain’s web3 plugins offer CI/CD support, so that when you push your git project, you automatically export all of your recently changed contracts in your project to your SIMBA Chain org. In this process, any contracts that you have made recent changes to will be compiled and exported to SIMBA Chain. If no changes have been made to your contracts, then nothing will be exported to SIMBA Chain.

### Requirements & Configuration
To use SIMBA’s plugins' CI/CD functionality, you will need to be working with a Hardhat project that has the SIMBA Chain Hardhat plugin installed. Please see the following for more details on installing and using our plugins:

1.Acquire a client ID and secret from SIMBA Chain for step 4 (below). You can acquire a client ID and secret from the SIMBA Chain UI, by navigating to your org, then application, and then selecting “secrets” in the upper right hand corner of the page.
2. You will need to be working with a git project that supports CI/CD. The setup for different providers varies, but the directions for getting started with CI/CD in Gitlab are here: https://docs.gitlab.com/ee/ci/quick_start/
3. You will need to configure three protected environment variables in your git service environment:

    a. SIMBA_PLUGIN_ID
    b. SIMBA_PLUGIN_SECRET
    c. SIMBA_PLUGIN_AUTH_ENDPOINT (if you don’t set this last variable, it defaults to “/o/”)

4. Since these are protected variables, you will probably need to be pushing from a protected branch, regardless of your git service.
5. You will then need to create your pipeline. In Gitlab, that means creating a .gitlab-ci.yml file. Your pipeline will look different, depending on which plugin you’re using. Here is what a pipeline for gitlab would look like:

```yaml
image: node:16.14.2

stages:
  - install_dependencies_and_run

job_install_compile_and_run:
  stage: install_dependencies_and_run
  script:
    - npm install
    # following will use the organisation and application from your simba.json
    - npx hardhat simba login --interactive false
    # # if you always want to use the same org and app, then provide <org name> and <app name> below
    # # but this approach only works if your 'organisation' and 'application' are set in simba.json,
    # # which you can do by running 'npx hardhat simba login' before pushing
    # - npx hardhat simba login --interactive false --org <org name> --app <app name>
    # pull most recently changed contracts to simba.json:
    - npx hardhat simba pull
    - npx hardhat simba export --interactive false
```

### CI/CD Process

The process for enabling CI/CD in your team’s workflow is very simple. We list the steps here:

1. run git pull:
```
$ git pull
```

2. run simba pull:
```
$ npx hardhat simba pull
```

this command ensures that your simba.json source code for each contract is up to date. To determine which contracts need to be exported, the plugin compares the source code it finds in your simba.json to the source code it finds in compiled artifacts. If there is a difference, then the plugin knows that a contract has changed and needs to be exported. Running simba pull is necessary because in CI/CD, exporting happens in the git service environment, so there is no way for your simba.json to be updated with most recent source code during export. So what simba pull does is retrieve that source code from SIMBA Chain and write it to your simba.json

You may notice above in the pipeline that simba pull is run inside the pipeline. This is as a precaution, in case you forgot to run in your local environment. It’s never a bad idea to include simba pull in your CI/CD pipeline, but it will make the pipeline run more slowly.

3. modify contracts as desired within your project

4. compilation of contracts is optional. The Hardhat and Truffle plugins automatically compile your contracts when exported.

5. run git push:
```
$ git push
```

And that’s it!

So if you were to make changes to a contract called TestContractVt6, then run git push, you would see in your pipeline job logs that this contract was exported to SIMBA Chain