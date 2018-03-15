/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const path = require('path');
const fs = require('fs');

import * as ModelData from "./data-interfaces";
import { Logger } from '@yellicode/core';
import { JsonFileReader } from './json-file-reader';
import * as Consts from './yellicode-constants'

export interface PathResolverResult {
    path: string;
    isDuplicate: boolean;
}

export class ReferencePathResolver {
    private _baseDirectory: string;
    private _nodeModulesDirectory: string;
    private _logger: Logger;
    private _resolvedPaths: string[] = [];

    constructor(logger: Logger, fileName: string) {
        this._logger = logger;
        this._baseDirectory = path.dirname(fileName);
        this._nodeModulesDirectory = path.join(this._baseDirectory, "node_modules");
    }

    public resolve(reference: ModelData.DocumentReferenceData): Promise<PathResolverResult> {
        let innerResult: Promise<string>;

        switch (reference.location) {
            case 'local':
                innerResult = Promise.resolve(path.join(this._baseDirectory, reference.path));
                break;
            case 'npm':
                const packageName = reference.name || reference.path; // there is no name if the name and path are the same                              
                const packagePathSegments: string[] = [path.join(this._baseDirectory, "node_modules")];
                packagePathSegments.push(...packageName.split('/')) // deal with @scope/packageName, e.g. @mycompany/mypackage    
                const packageRootDirectory = path.join(...packagePathSegments);
                innerResult = this.readDocumentFileNameFromPackageJson(packageRootDirectory, packageName);
                break;
            default:
                return Promise.reject(`Cannot resolve document reference '${reference.path}.' Location '${reference.location}' is not supported.`);
        }
        return innerResult.then(fileName => {
            const normalizedFileName = fileName.toLowerCase();
            const result: PathResolverResult = { path: normalizedFileName, isDuplicate: false };
            if (this._resolvedPaths.indexOf(normalizedFileName) > -1) {
                result.isDuplicate = true;
            }
            else this._resolvedPaths.push(normalizedFileName);
            return result;
        })
    }

    private readDocumentFileNameFromPackageJson(packageRootDirectory: string, packageName: string): Promise<string> {
        if (!fs.existsSync(packageRootDirectory)) {
            return Promise.reject(`Referenced NPM package '${packageName}' was not found in '${this._nodeModulesDirectory}'.`);
        }
        // Find a package.json
        const packageJsonFileName = path.join(packageRootDirectory, 'package.json');
        if (!fs.existsSync(packageJsonFileName)) {
            return Promise.reject(`Cannot determine filename for NPM reference '${packageName}'. File '${packageJsonFileName}' not found.`);
        }
        return JsonFileReader.readFile(packageJsonFileName).then((packageJsonFile) => {
            if (!(Consts.YELLICODE_SECTION_NAME in packageJsonFile)) {
                return Promise.reject(`Package '${packageName}' is missing package.json entry '${Consts.YELLICODE_SECTION_NAME}'.`);
            }
            const yellicodeSection = packageJsonFile[Consts.YELLICODE_SECTION_NAME];
            if (!(Consts.YELLICODE_MODEL_NAME in yellicodeSection)) {
                return Promise.reject(`Package '${packageName}' is missing package.json entry '${Consts.YELLICODE_SECTION_NAME}.${Consts.YELLICODE_MODEL_NAME}'.`);
            }
            // Now we have path relative to the package.json. Ensure an extension and resolve it.
            let relativePath = yellicodeSection[Consts.YELLICODE_MODEL_NAME];
            const modelExtension = path.extname(relativePath);
            if (!modelExtension) {
                relativePath = relativePath + Consts.YELLICODE_DOCUMENT_EXTENSION;
            }
            return path.join(packageRootDirectory, relativePath);
        });
    }
}