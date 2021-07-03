const path = require("path");
import { ConsoleLogger, LogLevel } from "@yellicode/core";
import { ConfigStore } from "../../../src/config-store";
import { ModelStore } from "../../../src/model-store";
import { TemplateRunner } from "../../../src/template-runner";
import { InputWatcher } from "../../../src/input-watcher";
import { ConfigReader } from "../../../src/config-reader";
import { Compiler } from "../../../src/compiler";
const exec = require("await-exec");

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

let logLevel = LogLevel.Info;

/**
 * Well, a logger.... one that logs to the console...
 */
const logger = new ConsoleLogger(console, logLevel);
// const logger = new ConsoleLogger(console, logLevel, true); // include timestamps

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
const templateRunner: TemplateRunner = new TemplateRunner(
  configStore,
  modelStore,
  logger,
  compiler,
  debugTemplate,
  watch
);
/**
 * Watches changes to input files (template- and model files) and invokes the template runner when something changed.
 */
const inputWatcher = new InputWatcher(templateRunner, modelStore, logger); // modelStore also implements IModelCache
/**
 * Reads (and watch changes to) config files and pass the results to the config store.
 */
const configReader: ConfigReader = new ConfigReader(
  configStore,
  inputWatcher,
  templateRunner,
  logger,
  watch
);

function errorHandler(err: any) {
  logger.error(`An unhandler error has occured: ${err}.`);
  process.exit();
}

const workingDirectory = path.resolve(".");

export async function start() {
  const recursive = false; // recursively searches the working dir for codegenconfig.json files. Enable if needed and when fully tested.
  logger.info(
    `Panacloud is starting in working directory ${workingDirectory}.`
  );

  logger.verbose(`Template debugging: ${debugTemplate}. Watching: ${watch}.`);

  await configReader
    .readDirectory(workingDirectory, recursive, false)
    .then(() => {
      templateRunner.runAll().then(async () => {
        await exec(`npx prettier --write .`);
        process.exit(); // not watching, so exit
      }, errorHandler);
    })
    .catch((err) => {
      logger.error(err);
    });
}
