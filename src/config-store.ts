/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const fs = require('fs');
const path = require('path');

import * as _ from 'lodash';

export class ConfigStore {

    /**
     * List of templates being detected in any of the config files found in the root directory. 
     */
    private templates: ITemplateInfo[] = [];
    private templateTypeScriptConfigs: { [configFile: string]: ITemplateCompilationConfig } = {};

    constructor() {

    }

    public addTemplate(template: ITemplateInfo): boolean {
        this.templates.push(template);
        return true;
    }

    public listAllTemplateUsingTemplateFile(fileName: string): ITemplateInfo[] {
        if (!fileName) return [];
        const safeFileName = fileName.toLowerCase();
        return this.templates.filter((item: ITemplateInfo) => {
            return safeFileName === item.templateFile.toLowerCase();
        })
    }

    public listAllTemplates(): ITemplateInfo[] {
        return this.templates;
    }

    public listAllTemplatesRequiringCompilation(): ITemplateInfo[] {
        return this.templates.filter((item: ITemplateInfo) => item.requiresCompilation);
    }

    public listAllTemplatesUsingModel(modelFile: string): ITemplateInfo[] {
        return this.templates.filter((item: ITemplateInfo) => modelFile === item.modelFile);
    }

    public listAllTemplatesFromConfigFile(configFile: string): ITemplateInfo[] {
        return this.templates.filter((item: ITemplateInfo) => configFile === item.configFile);
    }

    public removeTemplates(configFileName: string): ITemplateInfo[] {
        return _.remove(this.templates, (item: ITemplateInfo) => configFileName === item.configFile);
    }

    public setTemplateCompilationConfig(configFileName: string, config: ITemplateCompilationConfig): void {
        this.templateTypeScriptConfigs[configFileName] = config;
    }

    public getTemplateCompilationConfig(configFileName: string): ITemplateCompilationConfig {
        if (this.templateTypeScriptConfigs.hasOwnProperty(configFileName)) {
            return this.templateTypeScriptConfigs[configFileName];
        }
        return { compile: false, typeScriptConfigFile: null };
    }

    private hasTemplate(fileName: string): boolean {
        return this.listAllTemplateUsingTemplateFile(fileName) != null;
    }
}
