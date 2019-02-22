/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process'); // or import { ChildProcess } from 'child_process'; ??;
const process = require('process');
import * as ts from "typescript";
import * as _ from 'lodash';
import { Logger } from '@yellicode/core';
import { Compiler } from "./compiler";
import { TemplateProcess } from "./template-process";
import { ConfigStore } from "./config-store";
import { PathUtility } from "./path-utility";

export class TemplateRunner {
    private runningTemplates: { [templateId: string]: ITemplateInfo } = {};

    constructor(
        private configStore: ConfigStore,
        private modelStore: IModelStore,
        private logger: Logger,
        private compiler: Compiler,
        private enableDebugging: boolean,
        private isWatching: boolean) {

    }

    public runAll(): Promise<void> {
        this.logger.verbose('Running all templates...')
        return this.runTemplatesGroupedByConfigFile(this.configStore.listAllTemplates());
    }

    public runTemplatesUsingModel(fileName: string): Promise<void> {
        this.logger.verbose(`Running all templates with model '${fileName}'...`)
        return this.runTemplatesGroupedByConfigFile(this.configStore.listAllTemplatesUsingModel(fileName));
    }

    public runTemplatesUsingConfigFile(configFileName: string): Promise<void> {
        this.logger.verbose(`Running all templates in config file '${configFileName}'...`)
        const compilationConfig = this.configStore.getTemplateCompilationConfig(configFileName);
        return this.runTemplatesFromTemplateInfo(this.configStore.listAllTemplatesFromConfigFile(configFileName), compilationConfig);
    }

    private runTemplatesGroupedByConfigFile(templates: ITemplateInfo[]): Promise<void> {
        var grouped = _.groupBy(templates, 'configFile');
        const promises: Promise<void>[] = [];
        for (var configFile in grouped) {
            const compilationConfig = this.configStore.getTemplateCompilationConfig(configFile);
            const templates = grouped[configFile];
            promises.push(this.runTemplatesFromTemplateInfo(templates, compilationConfig));
        }

        // Convert Promise<void[]> (Promise.all) to Promise<void>
        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, (reason) => {
                reject(reason);
            })
        });
    }

    /**
     * 
     * @param fileName The full path to the template file. The path can have a .js or .ts extension. 
     */
    public runTemplatesUsingTemplateFile(fileName: string, requireRecompilation: boolean): Promise<void> {
        if (!fileName)
            return Promise.reject('FileName is undefined.')

        fileName = fileName.toLowerCase();

        // Ensure a .js extension, not .ts or anything else. This may be the case where fileName is passed as a command line argument.
        fileName = PathUtility.ensureJsExtension(fileName);       

        // Lookup the template info
        var templateInfos = this.configStore.listAllTemplateUsingTemplateFile(fileName);
        if (templateInfos.length == 0) {
            this.logger.error(`Could not find configuration for template '${fileName}'. Please make sure that you provide a configured template path.`);
            return Promise.resolve(); // fail silently
        }

        // Force recompilation (because this function is called when a template file changes)
        if (requireRecompilation) {
            templateInfos.forEach(ti => {
                if (ti.requiresCompilation) {
                    ti.isCompiled = false
                };
            })
        }

        return this.runTemplatesGroupedByConfigFile(templateInfos);
    }

    public runTemplateFromTemplateInfo(templateInfo: ITemplateInfo): Promise<void> {
        const compilationConfig = this.configStore.getTemplateCompilationConfig(templateInfo.configFile);
        return this.runTemplatesFromTemplateInfo([templateInfo], compilationConfig);
    }

    private runTemplatesFromTemplateInfo(templateInfos: ITemplateInfo[], compilationConfig: ITemplateCompilationConfig): Promise<void> {
        if (templateInfos.length === 0) return Promise.resolve();

        const templatesToRun: ITemplateInfo[] = [];

        // If debugging: we can only debug one template at a time, so: the first file with debug:true, or otherwise just the first file. .
        if (this.enableDebugging) {
            let debugTarget = templateInfos.find(ti => ti.debug === true);
            if (!debugTarget) debugTarget = templateInfos[0]; // also needed when running using --debug-template --template 'myfileName'
            templateInfos = [debugTarget];
        }

        // Manage which templates are running
        templateInfos.forEach((ti) => {
            if (this.runningTemplates.hasOwnProperty(ti.id)) {
                this.logger.verbose(`Template '${ti.id}' is already running.`);
            } else {
                if (fs.existsSync(ti.originalTemplateFile)) {
                    this.runningTemplates[ti.id] = ti;
                    templatesToRun.push(ti);
                }
                // If a template doesn't exist, yield an error and don't include it                
                else this.logger.error(`Template file '${ti.originalTemplateFile}' not found.`);
            }
        });

        if (templatesToRun.length === 0) {
            // All templates are already running. This might happen if multiple file changes 
            // are triggered within a very short timespan.
            return Promise.resolve();
        }

        return this.compileTemplates(templatesToRun, compilationConfig)
            .then((result: ICompileResult) => {
                return this.runCompiledTemplates(templatesToRun);
            })
            .then(() => {
                // this.logger.verbose('All templates done, updating run status.')
                templatesToRun.forEach(ti => { delete this.runningTemplates[ti.id]; });
            });
    }

    private compileTemplates(templates: ITemplateInfo[], typeScriptConfig: ITemplateCompilationConfig): Promise<ICompileResult> {
        if (!typeScriptConfig.compile)
            return Promise.resolve<ICompileResult>({ success: true });

        const templatesToCompile = _.filter(templates, t => t.requiresCompilation && !t.isCompiled);
        
        if (templatesToCompile.length === 0) {
            this.logger.verbose(`Not compiling templates because all templates are up to date.`);
            return Promise.resolve<ICompileResult>({ success: true });
        }     
        
        let templateFiles = templatesToCompile.map(ti => { return ti.originalTemplateFile; });
        // If multiple instances of a template file are configured (which is ok), templatesToCompile contains multiple TemplateInfos pointing
        // to the same file. Note: do not filter templatesToCompile, because we update isCompiled for each instance.            
        templateFiles = _.uniqBy(templateFiles, f => {return f.toLowerCase();});

        let compilerPromise: Promise<ICompileResult>;
        const templateLoggingInfo = templateFiles.length === 1 ? `template file '${templateFiles[0]}'` : `${templateFiles.length} template files`;
        const tsConfigPath = typeScriptConfig.typeScriptConfigFile;        
        if (tsConfigPath != null && fs.existsSync(tsConfigPath)) {
            this.logger.info(`Compiling ${templateLoggingInfo} using TypeScript configuration ${tsConfigPath}...`);            
            compilerPromise = this.compiler.compileWithTsConfigFile(templateFiles, tsConfigPath);
        } else {
            this.logger.info(`Compiling ${templateLoggingInfo} using default TypeScript configuration...`);            
            compilerPromise = this.compiler.compile(templateFiles);
        }
        return compilerPromise.then((result) => {
            // Mark each template as compiled, even if not succesful, the log will report any compilation errors and
            // isCompiled will be reset once the user updates the template.
            templatesToCompile.forEach(ti => ti.isCompiled = true);
            if (!result.success) {
                this.logger.warn(`Compilation of one or more templates has failed. See the console for details.`);
            }
            return result;
        });
    }

    private runCompiledTemplates(templates: ITemplateInfo[]): Promise<void> {
        this.logger.info(`Running ${templates.length} templates...`);
        const promises: Promise<void>[] = [];
        // Create a promise for each template to run. If one fails, the others should continue,
        // so just catch and log.
        templates.forEach((t) => {
            promises.push(this.runCompiledTemplate(t).catch((reason) => {
                this.logger.error(`Failed running template '${t.templateFile}': ${reason}`);
            }));
        });

        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                this.logger.info(this.isWatching ? 'Code generation done. Watching for changes.' : 'Code generation done.');
                resolve();
            });
        });
    }

    private runCompiledTemplate(templateInfo: ITemplateInfo): Promise<void> {
        let promise: Promise<void>;
        if (templateInfo.modelFile == null) {
            promise = this.runTemplateProcess(templateInfo, null);
        } else {
            promise = this.modelStore.loadModel(templateInfo.modelFile)
                .then((model: any) => {
                    //console.info("Promise (runCompiledTemplate): loadModel suceeded. Calling runTemplateProcess...");
                    return this.runTemplateProcess(templateInfo, model);
                });
        }
        return promise;
    }

    private runTemplateProcess(templateInfo: ITemplateInfo, model: any): Promise<void> {
        const fileName: string = templateInfo.templateFile;

        if (!fs.existsSync(fileName)) {
            return Promise.reject(`Template file '${fileName}' not found.`);
        }

        const templateProcess = new TemplateProcess(fileName, model, this.logger, this.enableDebugging, templateInfo.templateArgs, templateInfo.outputMode);
        this.logger.verbose(`Running template '${fileName}'...`);
        return templateProcess.run();
    }
}