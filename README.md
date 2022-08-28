# @pepperi-automation-testing-addons Typescript Template

A template for creating a pepperi automation test using QA team infra

* can run both locally and on the AWS server
* create a test file and tests serivce by NPM command - using addon UUID
* debug the tests in VSC 


## Installation
---
TODO
---

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

## Debugging
---
To debug your addon in `Visual Studio Code`, press `F5` or `Run->Start Debugging`.
You can then checkout your *API* at http://localhost:4600/tests/run. Be sure to supply a JWT for it to work.

## Publishing
---
the way I currently see it - no reason to publish this

## How To Use
---
1. you need to already have a published addon needed to be tested 
2. to create test files enter 'server-side' folder - run the CLI command `npm run create-test server-side {addonUUID}` while {addonUUID} is the tested addon UUID
2.1. this will create a service file inside `server-side\tests\api_tests\services` and a test file inside `server-side\tests\api_tests` - by the name of given addon, you can search these files by searching addons UUID
2.2. you can alreay call these by:
2.2.1 pressing `F5` to start the automation local server 
2.2.2 once the server is up - you can call tests by sending `POST` to `http://localhost:4600/tests/run` (you can take the postman inside `automation_assets`) just notice you have to have to use a valid pepperi token of a user which already has the addon installed on it inside the `Authorization` header 
2.2.3 you have to also pass `AddonUUID` and `isLocal` inside the body of this call:
2.2.3.1 `AddonUUID` should be the UUID of the tested addon, while `isLocal` is whether you want to run on local server or AWS
3. running on local server will mean you have to start your tested addon server locally on 4500 port - then calling the test with `"isLocal":"true"`

