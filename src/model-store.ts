/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const lock = require('lock'); // https://www.npmjs.com/package/lock
import { ReferencePathResolver, PathResolverResult } from './reference-path-resolver';
import { JsonFileReader } from './json-file-reader';
import { Logger } from '@yellicode/core';
import * as ModelData from "./data-interfaces";

export class ModelStore implements IModelStore, IModelCache {
    private _lock = lock();
    private _cache: any = {};
    private _logger: Logger;

    constructor(logger: Logger) {
        this._logger = logger;
    }

    public loadModel(fileName: string): Promise<any> {
        // First check the cache
        if (this._cache.hasOwnProperty(fileName)) {
            this._logger.verbose(`Returning model '${fileName}' from the cache.`);
            return Promise.resolve(this._cache[fileName]);
        }

        return new Promise<void>((resolve, reject) => {
            this.loadModelInternal(fileName, (err: any, model: any) => {
                if (err) {
                    reject(err);
                }
                else resolve(model);
            });
        });
    }

    private loadModelInternal(fileName: string, callback: (err: any, model: any) => void) {
        const cache = this._cache;

        // First obtain a lock on the filename, multiple templates might want to use the same model.
        this._lock(fileName, (release: Function) => {
            // We obtained a lock on filename. 
            const invokeReleaseLockFunc = release((err: any, model: any) => {
                callback(err, model);
            })

            // Check if another call already filled the cache in the meantime
            if (cache.hasOwnProperty(fileName)) {                
                this._logger.verbose(`Returning model '${fileName}' from the cache.`);
                invokeReleaseLockFunc(null, cache[fileName])
                return;
            }

            const referencePathResolver = new ReferencePathResolver(this._logger, fileName);
            this.readModelFile(fileName, referencePathResolver).then((model: any) => {
                // Add to the cache
                this._logger.verbose(`Adding model '${fileName}' to the cache.`);
                cache[fileName] = model;
                invokeReleaseLockFunc(null, model);

            }).catch((err) => {
                invokeReleaseLockFunc(err, null);
            });
        })
    }

    public invalidateCache(fileName: string) {
        if (!this._cache.hasOwnProperty(fileName))
            return;

        delete this._cache[fileName];
    }

    private readModelFile(fileName: string, referencePathResolver: ReferencePathResolver): Promise<any> {
        //  console.log(`Modelstore: reading file `+fileName);
        var promise = JsonFileReader.readFile(fileName).then(model => {
            // Is the model a plain JSON file or is it a document?
            const asDocument = model as ModelData.DocumentData;
            if (!(asDocument.modelTypeName && asDocument.modelTypeVersion)) {
                // Not a document: return as-is
                return Promise.resolve(model);
            }
            else {
                return this.readDocumentReferences(asDocument, fileName, referencePathResolver).then(() => { return asDocument; });
            }
        });

        return promise;
    }

    private readDocumentReferences(document: ModelData.DocumentData, fileName: string, referencePathResolver: ReferencePathResolver): Promise<void> {

        if (!document.references) return Promise.resolve();

        const promises: Promise<void>[] = [];
        document.references.forEach(r => {
            const promise = referencePathResolver.resolve(r)
                .then((result: PathResolverResult) => {
                    this._logger.verbose(`File name of ${r.location} reference ${r.name || r.path} : '${result.path}'.`);
                    // Load the referenced document. This will also read any referenced documents.
                    if (result.isDuplicate)
                        return Promise.resolve(); // avoid recursion

                    return this.readModelFile(result.path, referencePathResolver).then((model: ModelData.DocumentData) => {
                        r.document = model; //  store the model in the reference                        
                    });
                });
            promises.push(promise);
        });

        // Convert Promise<void[]> (Promise.all) to Promise<void>
        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => {
                resolve();
            }, (reason) => {
                reject(reason);
            })
        });
    }
}
