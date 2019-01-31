#!/usr/bin/env node
/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const path = require('path');
import { ConsoleLogger, LogLevel } from '@yellicode/core';
import { ConfigStore } from './config-store';
import { ModelStore } from './model-store';
import { TemplateRunner } from './template-runner';
import { InputWatcher } from './input-watcher';
import { ConfigReader } from './config-reader';
import { Compiler } from './compiler';
import { Initializer } from './initializer/initializer';

const WATCH_PROCESS_ARG = '--watch';
const WATCH_PROCESS_ARG_ALIAS = '-w';
const INIT_PROCESS_ARG = 'init';

const TEMPLATE_FILE_PROCESS_ARG = '--template';
const TEMPLATE_FILE_PROCESS_ARG_ALIAS = '-t';

const DEBUG_TEMPLATE_PROCESS_ARG = '--debug-template';
const LOG_LEVEL_ARG = '--log-level';

/**
 * True to let the user/IDE attach a debugger to the template child process.
 */
let debugTemplate = false;

/**
 * True to run once and not watch for changes in input files.
 */
let watch = false;

/**
 * If defined, runs a single template (although it must still be configured).
 */
let templateFileName: string;

/**
 * If true, don't run anything but the initializer.
 */
let initOnly: boolean = false;

let logLevel = LogLevel.Info;
const args = process.argv;

args.forEach((val, index, array) => {
    switch (val.toLowerCase()) {
        case DEBUG_TEMPLATE_PROCESS_ARG:
            debugTemplate = true;
            break;
        case WATCH_PROCESS_ARG:
        case WATCH_PROCESS_ARG_ALIAS:
            watch = true;
            break;
        case TEMPLATE_FILE_PROCESS_ARG:
        case TEMPLATE_FILE_PROCESS_ARG_ALIAS:
            templateFileName = array[index + 1];
            break;
        case LOG_LEVEL_ARG:
            const logLevelString = array[index + 1].toLowerCase();
            logLevel = LogLevel.parse(logLevelString) || logLevel;
            break;        
        case INIT_PROCESS_ARG:
            initOnly = true;
            break;
        default:
            break;
    }
});

/**
 * Well, a logger.... one that logs to the console...
 */
const logger = new ConsoleLogger(console, logLevel);
/**
 * Stores the template- and model info, and their relations.
 */
const configStore = new ConfigStore();
/**
 * Stores the model data.
 */
const modelStore: IModelStore = new ModelStore(logger);

/**
 * Compiles TS to JS.
 */
const compiler = new Compiler(logger);

/**
 * Runs code templates based on the template file name or 
 */
const templateRunner: TemplateRunner = new TemplateRunner(configStore, modelStore, logger, compiler, debugTemplate, watch);
/**
 * Watches changes to input files (template- and model files) and invokes the template runner when something changed.
 */
const inputWatcher = new InputWatcher(templateRunner, modelStore, logger); // modelStore also implements IModelCache
/**
 * Reads (and watch changes to) config files and pass the results to the config store.
 */
const configReader: ConfigReader = new ConfigReader(configStore, inputWatcher, templateRunner, logger, watch);

function errorHandler(err: any) {
    logger.error(`An unhandler error has occured: ${err}.`);
    process.exit(); 
}

const workingDirectory = path.resolve(".");

function start() {
    const recursive = false; // recursively searches the working dir for codegenconfig.json files. Enable if needed and when fully tested.    
    logger.info(`Yellicode is starting in working directory ${workingDirectory}.`);
    logger.verbose(`Template debugging: ${debugTemplate}. Watching: ${watch}.`);

    configReader.readDirectory(workingDirectory, recursive, false)
        .then(() => {
            if (templateFileName) {
                templateRunner.runTemplatesUsingTemplateFile(templateFileName, true).then(() => {
                    process.exit(); // not watching, so exit
                }, errorHandler);
            }
            else if (watch && !debugTemplate) {
                templateRunner.runAll().catch(errorHandler);
            }
            else templateRunner.runAll().then(() => {
                process.exit(); // not watching, so exit            
            }, errorHandler);
        })
        .catch((err) => {
            logger.error(err);
        });
}

if (initOnly) {
    const initializer = new Initializer(logger);
    initializer.run(workingDirectory).then(() => {
        logger.info('Yellicode initialization finished. Run \'yellicode\' or \'yellicode --watch\' to start code generation.');
        process.exit();
    });
}
else start();