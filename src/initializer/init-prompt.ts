/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { InitConfig } from "./init-config";
import * as path from 'path';
import * as rl from 'readline';
import { PathUtility } from "../path-utility";

export class InitPrompt {
    public static PromptForConfig(config: InitConfig): Promise<InitConfig> {        
        console.log('This utility will walk you through creating a codegenconfig.json file, a basic code generation template and an initial model file.');
        console.log('If the directory does not have a NPM package.json file, one will be created with sensible defaults (similar to the "npm init -y" command).');
        console.log();
   //     console.log(`Press ^C at any time to quit.`); // to be handled

        return InitPrompt.promptForString(`Model name: (${config.modelName})`)
            .then((modelName) => {                
                if (modelName) config.modelName = modelName;
                // console.log(`Using model ${config.modelName}`);
                return InitPrompt.promptForString(`Template file: (${config.templateFileName})`);
            })
            .then((templateFileName: string) => {       
                if (templateFileName) config.templateFileName = templateFileName;
                // console.log(`Using template ${config.templateFileName}`);                
                // Ask for the output file name, but first set the default based on the previous answer        
                config.outputFileName = PathUtility.removeTsExtension(config.templateFileName) + '-output.txt';
                return InitPrompt.promptForString(`Output file: (${config.outputFileName})`);
            }).then((outputFileName: string) => {
                if (outputFileName) config.outputFileName = outputFileName;
                // console.log(`Using output file ${config.outputFileName}`);                
                return config;                
            });
    }

    private static promptForString(question: string): Promise<string> {        
        return new Promise((resolve, reject) => {
            const { stdin, stdout } = process;
        
            stdin.resume();
            stdout.write(question);
        
            stdin.on('data', data => {
                let answer = data ? data.toString().trim() : null;
                if (answer && (answer.length === 0)) {answer = null};
                resolve(answer);
            });
            stdin.on('error', err => reject(err));
          });
    }
}