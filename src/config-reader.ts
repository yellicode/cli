/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const path = require('path');
const jsonparser = require('json-parser');
const chokidar = require('chokidar');

import { Logger } from '@yellicode/core';
import { FileSearch } from './file-search';
import { TemplateRunner } from './template-runner';
import * as consts from './yellicode-constants';
import * as _ from 'lodash';
import { ConfigStore } from './config-store';
import { InputWatcher } from './input-watcher';
import { PathUtility } from './path-utility';

// TODO: Promises, Promises<>...

export class ConfigReader {

    constructor(private configStore: ConfigStore, private inputWatcher: InputWatcher, private templateRunner: TemplateRunner, private logger: Logger, private watchFiles: boolean) {

    }

    private readFile(fileName: string, isFirstTime: boolean, autoRun: boolean, callback?: (err: any) => void) {
        if (!fs.existsSync(fileName)) {
            throw 'CodeGen: configuration file not found.';
        }

        fs.readFile(fileName, 'utf8', (err: any, text: string) => {
            if (err) {
                console.error('CodeGen: Error reading config file: %s', err);
            } else {
                try {
                    this.onConfigFileRead(text, fileName, isFirstTime, autoRun);
                } catch (e) {
                    err = `Error parsing config file ${fileName}: ${e}.`;
                    // this._logger.error();
                }
            }
            if (callback) {
                callback(err);
            }
        });
    }

    public readDirectory(dirName: string, recursive: boolean, autoRun: boolean, callback: (err: any) => void) {
        FileSearch.findFiles(dirName, recursive, consts.YELLICODE_CONFIG_FILE, (err: any, configFiles: string[] | null) => {
            if (err) {
                throw err;
            }
            if (!configFiles || configFiles.length === 0) {
                this.logger.warn(`No config files found in directory '${dirName}'.`);
                return callback(null);
            }

            this.logger.verbose(`Found ${configFiles.length} config files in directory '${dirName}'.`);
            this.logger.verbose(`Config files: ${configFiles.join(', ')}`);
            var numberOfFilesToRead: number = configFiles.length;

            // Called when the loop below has finished
            var onAllFilesRead = () => {
                if (this.watchFiles) {
                    // Watch all config files for changes
                    const configWatcher = chokidar.watch(configFiles, { persistent: true });
                    configWatcher.on('change', (filePath: string) => { this.onConfigFileChanged(filePath) });
                    configWatcher.on('unlink', (filePath: string) => { this.onConfigFileDeleted(filePath) });
                    // Also start watching the directory for new config files
                    // Create a glob-expression (https://en.wikipedia.org/wiki/Glob_(programming))
                    var globExpression = recursive ? `${dirName}/**/${consts.YELLICODE_CONFIG_FILE}` : path.join(dirName, consts.YELLICODE_CONFIG_FILE);
                    const newFileWatcher = chokidar.watch(globExpression, { persistent: true });
                    newFileWatcher.on('add', (path: string) => {
                        // We also get 'add' events for files that are already there, so check for duplicates.
                        if (configFiles!.indexOf(path) === -1) {
                            this.logger.info(`Config file '${path}' has been added`);
                            this.readFile(path, true, autoRun, () => {
                                // Even watch te file in case of errors, the user may fix it
                                configWatcher.add(path);
                            });
                        }
                    });
                }

                // And call back
                callback(null);
            };

            // Load each file
            configFiles.forEach(filePath => {
                this.readFile(filePath,
                    true,
                    autoRun,
                    (err) => {
                        if (err)
                            throw err; // todo: Promises, promises

                        numberOfFilesToRead--;
                        if (numberOfFilesToRead <= 0 && callback) {
                            onAllFilesRead();
                        }
                    });
            });
        });
    }

    private onConfigFileRead(text: string, configFileName: string, isFirstTime: boolean, autoRun: boolean) {
        const config: CodeGenConfig = jsonparser.parse(text, null, true); // parse... true to remove comments
        if (!config || !config.templates)
            return;

        const dirName = path.dirname(configFileName); // for resolving configured file names
        const shouldCompileTypeScript: boolean = config.compileTypeScript || false;
        const typeScriptConfigFile = (shouldCompileTypeScript && config.typeScriptConfigFile) ? path.join(dirName, config.typeScriptConfigFile) : null;
        this.configStore.setTemplateCompilationConfig(configFileName, { compile: shouldCompileTypeScript, typeScriptConfigFile: typeScriptConfigFile });

        // Clean up the store for this config file so that it is refreshed
        this.configStore.removeTemplates(configFileName);
        config.templates.forEach((templateEntry: CodeGenTemplateConfig, index: number) => {
            let configuredTemplatePath: string = templateEntry.templateFile;
            if (!configuredTemplatePath || configuredTemplatePath.length === 0)
                return;

            // Compile TypeScript?
            let isTypeScriptTemplate: boolean = false;

            // Ensure a '.js' extension
            const templateExtension = path.extname(configuredTemplatePath);
            switch (templateExtension.toLowerCase()) {
                case '':
                    // No extension
                    configuredTemplatePath = configuredTemplatePath + '.js';
                    break;
                case '.ts':
                    isTypeScriptTemplate = true;
                    break;
                case '.js':
                default:
                    break;
            }

            // The configured file name is always relative to the config file. Make this a full path.
            //let originalTemplateFileName: string = path.join(dirName, configuredTemplatePath).toLowerCase(); // can be .ts or .js                
            // UPDATE: try not to change the case of the originalTemplateFileName, so that the the compiler creates files with the same casing
            let originalTemplateFileName: string = path.join(dirName, configuredTemplatePath); // can be .ts or .js                
            // The templateFileName should always have a .js extension
            const templateFileName: string = isTypeScriptTemplate ? PathUtility.ensureJsExtension(originalTemplateFileName) : originalTemplateFileName;
            // If TS compilation is not enabled, don't deal with .ts files and always use the .js file (compilation is assumed to be done externally)
            if (isTypeScriptTemplate && !shouldCompileTypeScript) originalTemplateFileName = templateFileName;

            // Now we have all template info
            const templateInfo: ITemplateInfo = {
                id: `template_${index + 1}`, // make id useable as property
                configFile: configFileName,
                templateFile: templateFileName,
                originalTemplateFile: originalTemplateFileName,
                requiresCompilation: isTypeScriptTemplate && shouldCompileTypeScript,
                isCompiled: false,
                debug: templateEntry.debug || false,
                templateArgs: templateEntry.templateArgs
            };

            // Get the model file (optional)
            if (templateEntry.modelFile) {
                // Ensure a '.ymn' extension                    
                let configuredModelPath: string = templateEntry.modelFile;
                const modelExtension = path.extname(configuredModelPath);
                if (!modelExtension || (modelExtension !== consts.YELLICODE_DOCUMENT_EXTENSION && modelExtension !== '.json')) {
                    configuredModelPath = configuredModelPath + consts.YELLICODE_DOCUMENT_EXTENSION;
                }
                // Make an absolute path
                templateInfo.modelFile = path.join(dirName, configuredModelPath).toLowerCase();
            }          
            
            this.configStore.addTemplate(templateInfo);
        });

        // Warn if TS files must be compiled but there are templates with no ts extension
        if (shouldCompileTypeScript) {
            var templatesRequiringCompilation = this.configStore.listAllTemplatesRequiringCompilation()
            if (templatesRequiringCompilation.length === 0) {
                this.logger.warn(`Config file' ${configFileName}' has compileTypeScript enabled but has no configured template with a .ts extension.`);
            }
        }

        // Watch (or unwatch) changes to template- and model files.
        // First watch/unwatch files, then run them. If we do this in the reverse order and running templates causes compilation of TS files,
        // the resulting .js files will be detected by the running watch task, which will result in an error that no ITemplateInfo could be
        // found for that .js file (this happens in the rare cases that the config switches from JS to TS).
        this.watchOrUnwatchInputFiles(configFileName);

        if (autoRun) {
            // Run all templates (we do this after any config file change, but also initially)
            this.templateRunner.runTemplatesUsingConfigFile(configFileName); // TODO: we get a Promise here but don't use it's result yet
        }
    }

    private watchOrUnwatchInputFiles(configFileName: string) {
        if (!this.watchFiles)
            return;

        // Check if all templates that are being watched are still in the config store
        const configuredTemplates = this.configStore.listAllTemplates();
        const templateFilesBeingWatched = this.inputWatcher.getWatchedTemplateFiles();
        const modelFilesBeingWatched = this.inputWatcher.getWatchedModelFiles();

        const templateFilesToWatch: string[] = [];
        const modelFilesToWatch: string[] = [];

        configuredTemplates.forEach((templateInfo: ITemplateInfo) => {
            // If the template is not being watched, add it
            if (templateFilesBeingWatched.indexOf(templateInfo.originalTemplateFile) === -1 && templateFilesToWatch.indexOf(templateInfo.originalTemplateFile) == -1) {
                templateFilesToWatch.push(templateInfo.originalTemplateFile);
            }
            // If the model is not being watched, add it
            if (templateInfo.modelFile != null && modelFilesBeingWatched.indexOf(templateInfo.modelFile) === -1 && modelFilesToWatch.indexOf(templateInfo.modelFile) === -1) {
                modelFilesToWatch.push(templateInfo.modelFile);
            }
        });

        // Now check which currently watched templates need to be unwatched
        const templateFilesToUnwatch: string[] = _.remove(templateFilesBeingWatched, (fileName: string) => {
            // Unwatch if the file is not configured anymore
            return !(_.some(configuredTemplates, (t: ITemplateInfo) => fileName === t.originalTemplateFile));
        })

        if (templateFilesToUnwatch.length > 0) {
            this.logger.verbose(`The following templates will be unwatched: ${templateFilesToUnwatch.join(', ')}`);
            this.inputWatcher.unwatchTemplateFiles(templateFilesToUnwatch);
        }

        if (templateFilesToWatch.length > 0) {
            this.logger.verbose(`The following templates will be watched: ${templateFilesToWatch.join(', ')}`);
            this.inputWatcher.watchTemplateFiles(templateFilesToWatch);
        }

        // Do the same for model files
        const modelFilesToUnwatch: string[] = _.remove(modelFilesBeingWatched, (fileName: string) => {
            // Unwatch if the file is not configured anymore
            return !(_.some(configuredTemplates, (t: ITemplateInfo) => fileName === t.modelFile));
        })

        if (modelFilesToUnwatch.length > 0) {
            this.logger.verbose(`The following models will be unwatched: ${modelFilesToUnwatch.join(', ')}`);
            this.inputWatcher.unwatchModelFiles(modelFilesToUnwatch);
        }

        if (modelFilesToWatch.length > 0) {
            this.logger.verbose(`The following models will be watched: ${modelFilesToUnwatch.join(', ')}`);
            this.inputWatcher.watchModelFiles(modelFilesToWatch);
        }
    }

    private onConfigFileChanged(filePath: string) {
        this.logger.info(`Config file ${filePath} has changed. Reloading...`);
        this.readFile(filePath, false, true);
    }

    private onConfigFileDeleted(filePath: string) {
        var deleted = this.configStore.removeTemplates(filePath);
        this.logger.info(`Config file ${filePath} was deleted. Removed ${(deleted != null) ? deleted.length : 0} templates.`);
    }
}

