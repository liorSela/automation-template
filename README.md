# @pepperi-automation-testing-addons Typescript Template

A template for creating a pepperi automation test using QA team infra

* can run both on an addon which is 'deployed' on local server and on the 'real' server
* create a test file and tests serivce by NPM command - using addon UUID
* debug the tests in VSC 

## Installation
---
1. run `npm run init` from the root

## Debugging
---
To debug your addon in `Visual Studio Code`, press `F5` or `Run->Start Debugging`.

## Sanity Testing That Everything Works
---
Once project is installed you can press `F5` to start local debug server, then you can use `Run local ActivityDataIndex test` postman collection from automation_assets to validate project is working - this is an example test from the automation framework.

## Project structure
---
The following is an overview of the project structure. 
The node_modules folder is in use by `npm`

#### Folders
|Folder | Description |
| ---:  | :---       |
| .vscode | vscode tasks & launch |
| client-side | TODO |
| server-side | Server Side Tests And Creation Script |
| automation_assets | Postman Collection Which Can Be Used As Template To Calling Tests |
| potentialQA_SDK | all files which contain the QA infra to run tests - QA SDK|
| script | JS script to create tests |
| server-side\tests | the function which represents the 'run' endpoint |
| server-side\tests\api_tests | location of all generated test files |
| server-side\tests\api_tests\services | location of all generated services files |


## Publishing
---
the way I currently see it - no reason to publish this

## How To Use
---
1. you need to already have a published addon needed to be tested 
 * you also have to set an enviorment variable named `VAR_USER` on your machine with your own var user
2. to create test files enter 'server-side' folder - run the CLI command `npm run create-test server-side {addonUUID}` while {addonUUID} is the tested addon UUID
 * this will create a service file inside `server-side\tests\api_tests\services` and a test file inside `server-side\tests\api_tests` - by the name of given addon, you can search these files by searching addons UUID
 * you can alreay call these by:
 * pressing `F5` to start the automation local server 
 * once the server is up - you can call tests by sending `POST` to `http://localhost:4600/tests/run` (you can take the postman inside `automation_assets`) just notice you have to use a valid pepperi token of a user which already has the tested addon installed on it inside the `Authorization` header 
 * you have to also pass `AddonUUID` and `isLocal` inside the body of this call:
    * `"AddonUUID"` - should be the UUID of the tested addon, while `"isLocal"` - is whether you want to run on local server or AWS
3. running on local server will mean you have to start your tested addon server locally on 4500 port - then calling the test with `"isLocal":"true"` inside the body

