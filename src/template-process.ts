/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const childProcess = require('child_process');
const path = require('path');

import { Logger } from '@yellicode/core';
import { IProcessMessage, ISetModelMessage } from '@yellicode/core';

const PROCESS_START_TIMEOUT = 5000;
const ACTIVE_PROCESS_POLL_INTERVAL = 3000;

export class TemplateProcess {

    private static debugPort: number = 5858; // the default debug port
    private hasTemplateActivity: boolean = false;
    /**
     * Reference counter for the number of active "generate(..)" or "generateFromModel(..)" calls in the template.
     */
    private generateCount: number = 0;

    constructor(private fileName: string, private modelData: any, private logger: Logger, private enableDebugging: boolean, private templateArgs:any) {

    }

    public run(): Promise<void> {
        const templateProcess = this.createTemplateProcess();

        // Give the process some time to get started. For example, the timeout will expire if the user never imports the Generator at all.
        if (!this.enableDebugging) {
            setTimeout(() => {
                if (this.hasTemplateActivity || !templateProcess.connected)
                    return;

                this.logger.error(`Child process for template '${this.fileName}' did not start any activity within the specified amount of time. Disconnecting.`);
                templateProcess.disconnect();
            }, PROCESS_START_TIMEOUT);
        }

        return new Promise((resolve, reject) => {
            templateProcess.on('error', (err: Error) => {
                return reject(err);
            });

            templateProcess.on('exit', (code: number) => {
                if (code === 0) {
                    this.logger.verbose(`Template process for '${this.fileName}' has exited with success code ${code}.`);
                    resolve();
                } else {
                    reject(`Template process for '${this.fileName}' has exited with code ${code}.`);
                }
            });

            templateProcess.on('message', (m: IProcessMessage) => {
                if (!this.hasTemplateActivity) {
                    // We (most likely) received a 'processStarted' message. This message is sent when the single-instance Generator is created by the template process.
                    // It is exported as a single instance by the templating package so we should receive it only once.                    
                    this.logger.verbose(`Template process for '${this.fileName}' has started.`);
                    this.hasTemplateActivity = true;
                    this.manageActiveProcess(templateProcess);
                }
                switch (m.cmd) {
                    case 'generateStarted':
                        this.hasTemplateActivity = true;
                        this.generateCount++;
                        // this.logger.verbose(`Received generateStarted message. Generate count: ${this.generateCount}.`)
                        break;
                    case 'generateFinished':
                        this.generateCount--;
                        // this.logger.verbose(`Received generateFinished message. Generate count: ${this.generateCount}.`)
                        break;
                    case 'getModel':
                        this.hasTemplateActivity = true;
                        // The template requested the configured model. If there is one, it is already loaded (and cached) at this point.
                        if (this.modelData == null) {
                            this.logger.warn(`Template '${this.fileName}' has no configured model. Please check the code generation config.`);
                        }
                        let setModelMessage: ISetModelMessage = { cmd: 'setModel', modelData: this.modelData };
                        templateProcess.send(setModelMessage);
                        break;
                    default:
                        break;
                }
            });
        });
    }

    private manageActiveProcess(templateProcess: any): void {
        if (this.enableDebugging) {
            // never disconnect while user is debugging
            return;
        }
        // Monitor the child process.            
        var intervalId = setInterval(() => {
            if (!templateProcess.connected) {
                clearInterval(intervalId); // the process has already stopped
                return;
            }
            // The child process is active and connected.
            let shouldDisconnect = this.generateCount === 0;
            if (shouldDisconnect) {
                if (templateProcess.connected) {
                    templateProcess.disconnect();
                }
                clearInterval(intervalId);
                this.logger.verbose(`Disconnected child process for template '${this.fileName}'.`);
            }
        }, ACTIVE_PROCESS_POLL_INTERVAL);
    }

    private createTemplateProcess(): any {
        var execArgv = [];

        // console.log(`CodeGen: Working dir for template ${fileName} is ${workingDir}.`);
        if (this.enableDebugging) {
            // If this process is in debug mode, the forked process will also use process.execArgv - and the same debug port 5858 -. This would result
            // in a "childprocess.fork EADDRINUSE :::5858." So, for debug mode we need to assign a port for each child process.
            var debugPort = ++TemplateProcess.debugPort;
            execArgv.push(`--debug-brk=${debugPort}`); // debug-brk stops the process at the first line until a debugger is attached            
            this.logger.info(`Waiting for debugger to attach on port ${debugPort}...`);
            // console.log(`In Visual Studio 2015 or later, press CTRL+ALT+P, select Node.js remote debugging and use qualifier tcp://localhost:${debugPort}#ping=0`);
            // console.log(`In Visual Studio Code, start debugging (type: 'node') using request type 'attach' and set the port to ${debugPort}.`);
        }
        // Determine the working directory of the template process. This must be the directory in which the template resides, so that
        // paths relative to the template are resolved correctly.
        const workingDir = path.dirname(this.fileName);
        const options = { env: process.env, silent: false, execArgv: execArgv, cwd: workingDir };
        const processArgs: string[] = [];                
        if (this.templateArgs) {
            processArgs.push('--templateArgs');
            processArgs.push(JSON.stringify(this.templateArgs));
        }        
        return childProcess.fork(this.fileName, processArgs, options);
    }
}