/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const chokidar = require('chokidar');
const path = require('path');

import { Logger } from '@yellicode/core';
import { TemplateRunner } from "./template-runner";

export class InputWatcher {

    /**
    * Watches for changes to template files.
    */
    private templatesWatcher: any = null;
    private modelsWatcher: any = null;

    constructor(private templateRunner: TemplateRunner, private modelCache: IModelCache, private logger: Logger) {

    }

    watchTemplateFiles(files: string[]): void {
        if (this.templatesWatcher == null) {
            this.templatesWatcher = chokidar.watch(files, { persistent: true });
            this.templatesWatcher.on('change', (templateFile: string) => {
                this.logger.info(`Template '${templateFile}' has changed. Running template...`);
                // Wait a little to make sure that the file write process has finished (had this issue with a 200KB file on Windows)
                setTimeout(() => {
                    debugger;
                    this.templateRunner.runTemplatesUsingTemplateFile(templateFile, true)
                        .catch(e => {
                            this.logger.error(e);
                        });
                }, 1000)

            });
        } else this.templatesWatcher.add(files);
    };

    watchModelFiles(files: string[]): void {
        if (this.modelsWatcher == null) {
            this.modelsWatcher = chokidar.watch(files, { persistent: true });
            this.modelsWatcher.on('change', (modelFile: string) => {
                this.logger.info(`Model '${modelFile}' has changed. Running template(s)...`);
                this.modelCache.invalidateCache(modelFile);
                // Wait a little to make sure that the file write process has finished (had this issue with a 200KB file on Windows)
                setTimeout(() => {
                    this.templateRunner.runTemplatesUsingModel(modelFile)
                        .catch(e => {
                            this.logger.error(e);
                        });
                }, 1000)
            });
        } else this.modelsWatcher.add(files);
    };

    getWatchedTemplateFiles(): string[] {
        if (this.templatesWatcher == null)
            return [];

        return InputWatcher.getWatched(this.templatesWatcher);

    };

    getWatchedModelFiles(): string[] {
        if (this.modelsWatcher == null)
            return [];

        return InputWatcher.getWatched(this.modelsWatcher);
    }


    unwatchTemplateFiles(files: string[]) {
        if (this.templatesWatcher == null)
            return;

        this.templatesWatcher.unwatch(files);
    }

    unwatchModelFiles(files: string[]) {
        if (this.modelsWatcher == null)
            return;

        this.modelsWatcher.unwatch(files);
    }


    private static getWatched(watcher: any): string[] {
        const result: string[] = [];
        // getWatched() returns an object with dir paths as keys and arrays of contained paths as values.
        const watched = watcher.getWatched();
        for (let dirName in watched) {
            if (watched.hasOwnProperty(dirName)) {
                const filesInDir = watched[dirName];
                filesInDir.forEach((f: string) => {
                    result.push(path.join(dirName, f))
                });
            };
        };
        return result;
    }
}