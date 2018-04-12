/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as path from 'path';
import * as fs from "fs";

import { Logger } from '@yellicode/core';
import * as model from "../data-interfaces";
import * as consts from '../yellicode-constants';
import { NpmInstaller } from './npm-installer';
import { ModelBuilder } from './model-builder';
import { InitConfig } from './init-config';
import { InitPrompt } from './init-prompt';

export class Initializer {
    private npmInstaller: NpmInstaller;

    constructor(private logger: Logger) {
        this.npmInstaller = new NpmInstaller(logger);
    }

    public run(workingDir: string): Promise<void> {
        const baseName = path.basename(workingDir);

        // const defaultConfig: InitConfig = {
        //     modelName: 'metextensie.ymn', 
        //     templateFileName: `zonderextensie`, 
        //     outputFileName: `zomaariets.txt`};  

        // Initializer.sanitizeConfig(defaultConfig);
        // return this.runInternal(workingDir, defaultConfig);

        const defaultConfig: InitConfig = {
            modelName: baseName,
            templateFileName: `${baseName}.template.ts`,
            outputFileName: `${baseName}.template-output.txt`
        };


        return InitPrompt.PromptForConfig(defaultConfig).then(config => {
            Initializer.sanitizeConfig(config);
            return this.runInternal(workingDir, config);
        })
    }

    private static sanitizeConfig(initConfig: InitConfig) {        
        // Ensure no extension on the model name
        initConfig.modelName = path.parse(initConfig.modelName).name;
        // Ensure a ts extension on the template name
        initConfig.templateFileName = path.parse(initConfig.templateFileName).name + '.ts';
    }

    private runInternal(workingDir: string, initConfig: InitConfig): Promise<void> {
        // Create a model file
        const modelFileName = initConfig.modelName + consts.YELLICODE_DOCUMENT_EXTENSION;
        this.logger.info(`Creating model ${modelFileName}...`);
        return Initializer.createModelFile(workingDir, modelFileName)
            .then(() => {
                // Create a template file
                this.logger.info(`Creating template ${initConfig.templateFileName}...`);
                return Initializer.createTemplateFile(workingDir, initConfig.templateFileName, initConfig.outputFileName);
            })
            .then(() => {
                // Create a codegenconfig.json file
                this.logger.info(`Creating codegenconfig.json...`);
                return Initializer.createCodeGenConfigFile(workingDir, initConfig.templateFileName, modelFileName);
            })
            .then(() => {
                this.logger.info(`Installing NPM packages...`);                
                return this.npmInstaller.installDevPackages(workingDir, ['@yellicode/templating', '@yellicode/model']);
            }) 
            .catch((err) => {
                this.logger.error(err);
            });

    }

    private static createModelFile(workingDir: string, modelFileName: string): Promise<void> {
        const modelName = path.basename(modelFileName, consts.YELLICODE_DOCUMENT_EXTENSION);
        const document = ModelBuilder.buildSampleModel(modelName);

        const fullFileName = path.join(workingDir, modelFileName);
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(fullFileName, JSON.stringify(document, undefined, 4), (err) => {
                if (err) {
                    reject(err);
                }
                else resolve();
            });
        });
    }

    private static createTemplateFile(workingDir: string, templateFileName: string, outputFileName: string): Promise<void> {

        // Note: escape a `, { and } as \`, \{ and \} respectively
        const template = `import { Generator, TextWriter } from '@yellicode/templating';
import * as model from '@yellicode/model';
        
Generator.generateFromModel({ outputFile: './${outputFileName}' }, (writer: TextWriter, pack: model.Package) => {
    writer.writeLine(\`Output from template '${templateFileName}' with model '$\{pack.name\}', generated at $\{new Date().toISOString()\}.\`);
    writer.writeLine();
    pack.getAllClasses().forEach((c) => {
        writer.writeLine(\`Class $\{c.name\} has the following attributes:\`);
        writer.increaseIndent();
        c.ownedAttributes.forEach(att => {
            writer.writeLine(\`- $\{att.name\} ($\{att.getTypeName()\})\`);
        });
        writer.decreaseIndent();
    })
});`;

        const fullFileName = path.join(workingDir, `${templateFileName}`);
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(fullFileName, template, (err) => {
                if (err) {
                    reject(err);
                }
                else resolve();
            });
        });
    }

    private static createCodeGenConfigFile(workingDir: string, templateFileName: string, modelFileName: string) {
        const modelName = path.basename(modelFileName, consts.YELLICODE_DOCUMENT_EXTENSION);

        const config: CodeGenConfig = {
            compileTypeScript: true, templates: [
                { modelFile: modelName, templateFile: templateFileName }
            ]
        };

        const fullFileName = path.join(workingDir, consts.YELLICODE_CONFIG_FILE);
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(fullFileName, JSON.stringify(config, undefined, 4), (err) => {
                if (err) {
                    reject(err);
                }
                else resolve();
            });
        });
    }


}