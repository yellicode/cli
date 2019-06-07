/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as childProcess from 'child_process';
import * as path from 'path';
import * as semver from 'semver';

import { Logger } from '@yellicode/core';
import { IProcessMessage, ISetModelMessage } from '@yellicode/core';

const PROCESS_START_TIMEOUT = 5000;
const ACTIVE_PROCESS_POLL_INTERVAL = 500;
const DEFAULT_DEBUG_PORT_LEGACY = 5858;
const DEFAULT_DEBUG_PORT_INSPECTOR = 9229;

export class TemplateProcess {
    private static useLegacyDebugProtocol: boolean;
    private static debugPort: number = 5858; // the default debug port
    private hasSeenProcessMessages: boolean = false;
    private hasGeneratorActivity: boolean = false;

    /**
     * Reference counter for the number of active "generate(..)" or "generateFromModel(..)" calls in the template.
     */
    private generateCount: number = 0;

    constructor(private fileName: string, private modelData: any, private logger: Logger, private enableDebugging: boolean, private templateArgs: any, private outputMode?: string) {

    }

    static initialise() {        
        // The legacy debugger has been deprecated as of Node 7.7.0 (https://nodejs.org/en/docs/guides/debugging-getting-started/).
        // The inspector protocol is supported as of Node >= 6.3, but only v6.14.2 understands the --inspect-brk flag.
        if (semver.lt(process.version, '6.14.2')) {
            TemplateProcess.debugPort = DEFAULT_DEBUG_PORT_LEGACY;
            TemplateProcess.useLegacyDebugProtocol = true;
        }
        else {
            TemplateProcess.debugPort = DEFAULT_DEBUG_PORT_INSPECTOR;
            TemplateProcess.useLegacyDebugProtocol = false;
        }
    }

    public run(): Promise<void> {
        const templateProcess = this.createTemplateProcess();

        // Give the process some time to get started. For example, the timeout will expire if the user never imports the Generator at all.
        if (!this.enableDebugging) { // when debugging, the user needs time to attach to the child process   
            setTimeout(() => {
                if ((this.hasSeenProcessMessages && this.hasGeneratorActivity) || !templateProcess.connected)
                    return;

                this.logger.error(`Child process for template '${this.fileName}' did not start any activity within the specified amount of time. Disconnecting.`);
                templateProcess.disconnect();
            }, PROCESS_START_TIMEOUT);
        }

        return new Promise((resolve, reject) => {
            templateProcess.on('error', (err: Error) => {
                this.logger.verbose(`Error on template process for '${this.fileName}': ${err}.`);
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

            templateProcess.on('disconnect', () => {
                // The process has disconnected. Most likely because we disconnected in monitorActiveTemplateProcess().
                this.logger.verbose(`Template process for '${this.fileName}' has disconnected.`);             
                resolve();
            });

            templateProcess.on('message', (m: IProcessMessage) => {
                // The first process message is (most likely) a 'processStarted' message. This message is sent when the single-instance Generator is created by the template process.
                // It is exported as a single instance by the templating package so we should receive it only once.
                this.hasSeenProcessMessages = true;

                if (m.log) {                    
                    this.logger.log(m.log.message, m.log.level);
                }
                if (!m.cmd) 
                    return; // this was a log-only message

                let isGeneratorActivity = false;
                this.logger.verbose(`Received event '${m.cmd}' from template '${this.fileName}'. GenerateCount: ${this.generateCount}. Template activity: ${this.hasSeenProcessMessages}.`);
                switch (m.cmd) {
                    case 'generateStarted':
                        isGeneratorActivity = true;
                        this.generateCount++;
                        break;
                    case 'generateFinished':
                        isGeneratorActivity = true;
                        this.generateCount--;
                        break;
                    case 'getModel':
                        isGeneratorActivity = true;
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

                if (isGeneratorActivity && !this.hasGeneratorActivity) {
                    // This is the first generator activity: start monitoring.
                      
                    this.logger.verbose(`Start monitoring template process for '${this.fileName}'.`);
                    this.hasGeneratorActivity = true;
                    this.monitorActiveTemplateProcess(templateProcess);
                    // setTimeout(() => {
                    // }, ACTIVE_PROCESS_POLL_INTERVAL); // gives a double interval the first time (between 'processStarted' and the first 'generateStarted')
                }
            });
        });
    }

    private monitorActiveTemplateProcess(templateProcess: any): void {                
        // Monitor the child process.            
        var intervalId = setInterval(() => {
            this.logger.verbose(`Checking child process for template '${this.fileName}'. Connected ${templateProcess.connected}, generateCount: ${this.generateCount}`);
            if (!templateProcess.connected) {
                this.logger.verbose(`Lost connection with template process for '${this.fileName}'.`);
                clearInterval(intervalId); // the process has already stopped
                return;
            }
            // The child process is active and connected.
            let shouldDisconnect = this.generateCount === 0;
            if (shouldDisconnect) {
                if (templateProcess.connected) {
                    this.logger.verbose(`Disconnecting template process for '${this.fileName}'.`);
                    templateProcess.disconnect(); // this will trigger a 'disconnect' event that we handle in run()
                }
                clearInterval(intervalId);               
            }
        }, ACTIVE_PROCESS_POLL_INTERVAL);
    }

    private createTemplateProcess(): any {
        var execArgv = [];
        
        if (this.enableDebugging) {
            // If this process is in debug mode, the forked process will also use process.execArgv - and the same debug port 5858 -. This would result
            // in a "childprocess.fork EADDRINUSE :::5858." So, for debug mode we need to assign a port for each child process.
            const debugArg = this.getDebugProcessArg();
            execArgv.push(debugArg);            
        }
        // Determine the working directory of the template process. This must be the directory in which the template resides, so that
        // paths relative to the template are resolved correctly.
        const workingDir = path.dirname(this.fileName);
        // const inheritIO = [0, 1, 2, 'ipc']; // equivalent to [process.stdin, process.stdout, process.stderr] or 'inherit'
        // const pipeIO = ['pipe', 'pipe', 'pipe']; // default
        const options = { env: process.env, silent: false, execArgv: execArgv, cwd: workingDir};
        const processArgs: string[] = [];
        if (this.templateArgs) {
            processArgs.push('--templateArgs');
            processArgs.push(JSON.stringify(this.templateArgs));
        }        
        if (this.outputMode){
            processArgs.push('--outputMode');
            processArgs.push(this.outputMode);
        }
        return childProcess.fork(this.fileName, processArgs, options);
    }

    private getDebugProcessArg(): string {        
        const debugPort = ++TemplateProcess.debugPort;
        let arg: string;

        // The inspector protocol is supported as of Node >= 6.3.
        // The legacy debugger has been deprecated as of Node 7.7.0 (https://nodejs.org/en/docs/guides/debugging-getting-started/).
        // 'debug-brk' and 'inspect-brk' stops the process at the first line until a debugger is attached  
        if (TemplateProcess.useLegacyDebugProtocol) {
            // legacy: the original V8 Debugger Protocol 
            this.logger.warn(`Using the legacy V8 debugger protocol because the current node.js version is ${process.version}.`);
            arg = `--debug-brk=${debugPort}`; 
        }
        else {
            // inspector: the new V8 Inspector Protocol
            arg = `--inspect-brk=${debugPort}`;
        }

        this.logger.info(`Waiting for debugger to attach on port ${debugPort}...`);
        // console.log(`In Visual Studio 2015 or later, press CTRL+ALT+P, select Node.js remote debugging and use qualifier tcp://localhost:${debugPort}#ping=0`);
        // console.log(`In Visual Studio Code, start debugging (type: 'node') using request type 'attach' and set the port to ${debugPort}.`);
        return arg;
    }
}

// Start static initialization
TemplateProcess.initialise();