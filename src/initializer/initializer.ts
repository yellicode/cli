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
        // Ensure *no* extension on the model name        
        if (initConfig.modelName.endsWith(consts.YELLICODE_DOCUMENT_EXTENSION)) {
            initConfig.modelName = initConfig.modelName.substring(0, initConfig.modelName.length - 4);
        }

        // Ensure a ts extension on the template name
        if (!initConfig.templateFileName.endsWith('.ts')) {
            initConfig.templateFileName += '.ts';
        }
    }

    private runInternal(workingDir: string, initConfig: InitConfig): Promise<void> {
        // A modelName without a .json extension becomes a Yellicode model.
        // Otherwise it becomes a plain JSON document.
        const isJsonModel = initConfig.modelName.endsWith('.json');
        const modelFileName = isJsonModel ?
            initConfig.modelName :
            initConfig.modelName + consts.YELLICODE_DOCUMENT_EXTENSION;

        // Create a model file
        this.logger.info(`Creating model ${modelFileName}...`);
        return Initializer.createModelFile(workingDir, modelFileName, isJsonModel)
            .then(() => {
                // Create a template file
                this.logger.info(`Creating template ${initConfig.templateFileName}...`);

                return isJsonModel ? 
                    Initializer.createTemplateFileForJsonModel(workingDir, initConfig.templateFileName, initConfig.outputFileName, modelFileName) :
                    Initializer.createTemplateFile(workingDir, initConfig.templateFileName, initConfig.outputFileName);
            })
            .then(() => {
                // Create a codegenconfig.json file
                this.logger.info(`Creating codegenconfig.json...`);
                return Initializer.createCodeGenConfigFile(workingDir, initConfig.templateFileName, modelFileName);
            })
            .then(() => {
                const dependencies: string[] = ['@yellicode/templating'];
                if (!isJsonModel){
                    dependencies.push('@yellicode/elements');
                }
                this.logger.info(`Installing NPM packages (${dependencies.join(', ')})...`);
                return this.npmInstaller.installDevPackages(workingDir, dependencies);
            })
            .catch((err) => {
                this.logger.error(err);
            });

    }

    private static createModelFile(workingDir: string, modelFileName: string, isJsonModel: boolean): Promise<void> {
        let document: any;

        if (isJsonModel) {
            document = {};
        }
        else {
            const modelName = path.basename(modelFileName, consts.YELLICODE_DOCUMENT_EXTENSION);
            document = ModelBuilder.buildSampleModel(modelName);
        }

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

    private static createTemplateFileForJsonModel(workingDir: string, templateFileName: string, outputFileName: string, modelFileName: string): Promise<void> {
  // Note: escape a `, { and } as \`, \{ and \} respectively
  const template = `import { Generator, TextWriter } from '@yellicode/templating';  
          
Generator.generateFromModel({ outputFile: './${outputFileName}' }, (writer: TextWriter, model: any) => {
    writer.writeLine(\`Output from template '${templateFileName}' with JSON model '${modelFileName}', generated at $\{new Date().toISOString()\}.\`);      
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

    private static createTemplateFile(workingDir: string, templateFileName: string, outputFileName: string): Promise<void> {

        // Note: escape a `, { and } as \`, \{ and \} respectively
        const template = `import { Generator, TextWriter } from '@yellicode/templating';
import * as elements from '@yellicode/elements';
        
Generator.generateFromModel({ outputFile: './${outputFileName}' }, (writer: TextWriter, model: elements.Model) => {
    writer.writeLine(\`Output from template '${templateFileName}' with model '$\{model.name\}', generated at $\{new Date().toISOString()\}.\`);
    writer.writeLine();
    model.getAllTypes().forEach((t) => {
        writer.writeLine(\`Type $\{t.name\}: $\{t.getFirstCommentBody()\}\`);
        if (elements.isClass(t)) {
            writer.increaseIndent();
            writer.writeLine(\`Class $\{t.name\} has the following attributes:\`);
            t.ownedAttributes.forEach(att => {
                writer.writeLine(\`- $\{att.name\} ($\{att.getTypeName()\}): $\{att.getFirstCommentBody()\}\`);
            });
            writer.decreaseIndent();
        }
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