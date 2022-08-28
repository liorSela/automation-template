# @pepperi-automation-testing-addons Typescript Template

A template for creating a pepperi automation test using QA team infra

* can run both locally and on the AWS server
* create a test file and tests serivce by NPM command
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
---

## How To Use
---
1. 
---