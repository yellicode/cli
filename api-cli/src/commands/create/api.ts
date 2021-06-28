import { Command, flags } from "@oclif/command";
var Git = require("nodegit");
const ora = require("ora");
const chalk = require("chalk");
const exec = require("await-exec");
const fs = require("fs");

export default class Api extends Command {
  static description = "Create api";

  static flags = {
    help: flags.help({ char: "h" }),
    name: flags.string({
      char: "n",
      description: "API Name",
      default: "panacloud",
    }),
    token: flags.string({ char: "t", description: "Token", required: true }),
    template: flags.enum({
      options: ["todoApp", "starter"],
      char: "T",
      default: "starter",
      description: "Templates",
    }),
  };

  async todoAppTemplate(this: any, name: string, token: string) {
    const Spinner = new ora({
      text: `${chalk.white.bgYellow.bold("Cloning Git Repository...")}`,
      discardStdin: false,
    }).start();
    await Git.Clone("https://github.com/panacloud/todo-saas.git", name).then(
      function (repository: any) {
        return repository.getBranchCommit("main");
      }
    );
    Spinner.stop();
    this.log(chalk.bold(chalk.green("Git repository cloned")));
    const spinBack = new ora({
      text: `${chalk.white.bgYellow.bold("Installing Packages Backend")}`,
      discardStdin: false,
    }).start();
    await exec(`cd ${name}/backend && npm install`, (err: any) => {
      this.error(chalk.red({ err }));
    });
    spinBack.stop();
    this.log(chalk.bold(chalk.green("Done Installing Packages For Backend")));
    const spinFront = new ora({
      text: `${chalk.white.bgYellow.bold("Installing Packages Frontend")}`,
      discardStdin: false,
    }).start();
    await exec(`cd ${name}/frontend && npm install`, (err: any) => {
      this.error(chalk.red({ err }));
    });
    spinFront.stop();
    this.log(chalk.bold(chalk.green("Done Installing Packages For Frontend")));
    fs.writeFile(
      `${name}/backend/cdk.context.json`,
      `{
      "panacloud-api-token": "${token}"
   }`,
      (err: any) => {
        if (err) {
          this.error(chalk.red({ err }));
        }
      }
    );
    this.log(chalk.bold(chalk.green("Your API Is Ready")));
  }

  async starterTemplate(name: string, token: string) {
    const Spinner = new ora({
      text: `${chalk.white.bgYellow.bold("Initializing CDK project...")}`,
      discardStdin: false,
    }).start();
    await exec(
      `mkdir ${name} && cd ${name} && cdk init --language=typescript`,
      (err: any) => {
        this.error(chalk.red({ err }));
      }
    );
    Spinner.stop();
    this.log(chalk.bold(chalk.green("Initialized CDK project")));
    const SpinnerTwo = new ora({
      text: `${chalk.white.bgYellow.bold(
        "Initializing Panacloud CDK manger..."
      )}`,
      discardStdin: false,
    }).start();
    await exec(`cd ${name} && npm i testing-manager`, (err: any) => {
      this.error(chalk.red({ err }));
    });
    fs.writeFile(
      `${name}/cdk.context.json`,
      `{
      "panacloud-api-token": "${token}"
   }`,
      (err: any) => {
        if (err) {
          this.error(chalk.red({ err }));
        }
      }
    );
    fs.writeFile(
      `${name}/lib/${name}-stack.ts`,
      `import * as cdk from "@aws-cdk/core";
       import { PanacloudServerlessSaaSAPIManager } from 'testing-manager';
      
       export class ${name}Stack extends cdk.Stack {
          constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
             super(scope, id, props);
      
          const api_manager = new PanacloudServerlessSaaSAPIManager(this, "PanacloudAPIManager");
          
        }
      }`,
      (err: any) => {
        if (err) {
          this.error(chalk.red({ err }));
        }
      }
    );
    SpinnerTwo.stop();
    this.log(chalk.bold(chalk.green("Initialized Panacloud CDK manger")));
    this.log(chalk.bold(chalk.green("Your API Is Ready")));
  }

  async run() {
    const { flags } = this.parse(Api);
    if (flags.template === "todoApp") {
      this.todoAppTemplate(flags.name, flags.token);
    }
    if (flags.template === "starter") {
      this.starterTemplate(flags.name, flags.token);
    }
  }
}
