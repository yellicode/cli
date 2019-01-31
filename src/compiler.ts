/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

import { Logger } from '@yellicode/core';

/** 
 * Compiles TypeScript templates using the TypeScript comiler API.
 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 */
export class Compiler {
    private _logger: Logger;

    constructor(logger: Logger) {
        this._logger = logger;
    }

    /**
     * Compiles the template files using the specified tsconfig file.
     */
    public compileWithTsConfigFile(fileNames: string[], configFileName: string): Promise<ICompileResult> {
        // Extract configuration from config file
        const config = this.readConfigFile(configFileName);
        return this.compileInternal(fileNames, config.options);
    }

    /**
     * Compiles the template files using a default configuration.    
     */
    public compile(fileNames: string[]): Promise<ICompileResult> {
        // tsc options: https://www.typescriptlang.org/docs/handbook/compiler-options.html
        const options: ts.CompilerOptions = {
            noEmitOnError: true,
            target: ts.ScriptTarget.ES2015, // We must use use ECMAScript 6 (ES6)/ ECMAScript 2015 (ES2015)
            module: ts.ModuleKind.CommonJS, // NodeJS
            inlineSourceMap: true
        };
        return this.compileInternal(fileNames, options);
    }

    private reportDiagnostics(diagnostics: ts.Diagnostic[]): void {
        diagnostics.forEach(diagnostic => {
            if (diagnostic.category !== ts.DiagnosticCategory.Error)
                return;

            let message = '';
            if (diagnostic.file) {
                let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
                message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
            }
            message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            this._logger.error(message);
        });
    }

    public compileInternal(fileNames: string[], options: ts.CompilerOptions): Promise<ICompileResult> {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

        // If you get the error "Cannot find name 'require'.'", you need to install node types: https://stackoverflow.com/a/35961176
        this.reportDiagnostics(allDiagnostics);
        const exitCode = emitResult.emitSkipped ? 1 : 0;
        return Promise.resolve<ICompileResult>({ success: exitCode === 0 });
    }

    private readConfigFile(configFileName: string): ts.ParsedCommandLine {
        // Read config file
        const configFileText = fs.readFileSync(configFileName).toString();
        // Parse JSON, after removing comments. Just fancier JSON.parse
        const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
        const configObject = result.config;
        if (!configObject) {
            this.reportDiagnostics([result.error!]);
            process.exit(1);;
        }

        // Extract config infromation
        const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
        if (configParseResult.errors.length > 0) {
            this.reportDiagnostics(configParseResult.errors);
            process.exit(1);
        }

        return configParseResult;
    }
}