/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
interface CodeGenTemplateConfig {
    templateFile: string;
    modelFile?: string;
    debug?: boolean;
    templateArgs?: any;
    disable?: boolean;
    outputMode?: 'overwrite' | 'once' | 'append';
    connectionTimeout?: number;
}

interface CodeGenConfig {
    templates: CodeGenTemplateConfig[];
    compileTypeScript?: boolean;
    typeScriptConfigFile?: string;
}

// TODO: delete these interfaces or update their names

interface ITemplateInfo {
    /**
     * Gets an internally assigned unique id.
     */
    id: string;
    /**
     * Allows to override the default connection timeout.
     */
    connectionTimeout?: number;
    /**
     * Indicates from which config file the template info was read.
     */
    configFile: string;
    /**
     * The full path to the template file. This must be a path with a .js extension.
     * If compile is true, the corresponding .ts file is assumed to exist.
     */
    templateFile: string;
    /**
    * The full path to the original template file. This can be a path with a .js extension and a .ts extension.
    * the originalTemplateFile is the one that is watched for changes.
    */
    originalTemplateFile: string;
    /**
     * The full path to the model file.
     */
    modelFile?: string;
    /**
    * If true, template file is a TypeScript file that we should compile.
    */
    requiresCompilation: boolean;
    /**
     * True once the template is compiled and does not need any recompilation. This value must be rest to false
     * once the template has changed.
     */
    isCompiled: boolean;
    /**
     * When debugging and no debug target was specified, the first template info that has debug:true will be used
     * as debug target. Other templates will be ignored.
     */
    debug: boolean;

    /**
     * Contains any custom arguments that must be parsed to the template.
     */
    templateArgs?: any;

    /**
     * The output configured output mode. This value will be passed as-is to the template process.
     */
    outputMode?: string;
}

interface ITemplateCompilationConfig {
    /**
    * If true, TypeScript template files are compiled before they are run.
    */
    compile: boolean;
    /**
     * Contains the full path of a TypeScript config file, which will be used when compile is true.
     */
    typeScriptConfigFile: string | null;
}

interface IModelCache {
    invalidateCache(fileName: string): void;
}

interface IModelStore extends IModelCache {
    loadModel(fileName: string/*, callback: (err: string, model: any) => void*/): Promise<any>;
}

interface ICompileResult {
    success: boolean;
    output?: string;
}